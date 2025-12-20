// modules/analytics/analytics.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { Venue } from '../venues/entities/venue.entity';
import { CommissionRecord } from '../commissions/entities/commission-record.entity';
import { AnalyticsQueryDto, PeriodType } from './dto/analytics-query.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Venue)
    private venueRepository: Repository<Venue>,
    @InjectRepository(CommissionRecord)
    private commissionRepository: Repository<CommissionRecord>,
  ) {}

  async getBookingStats(queryDto: AnalyticsQueryDto, userId?: string) {
    const { startDate, endDate, venueId } = queryDto;

    const query = this.bookingRepository.createQueryBuilder('booking');

    if (startDate && endDate) {
      query.where('booking.booking_date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    if (venueId) {
      query.andWhere('booking.court_id IN (SELECT id FROM courts WHERE venue_id = :venueId)', {
        venueId,
      });
    }

    const total = await query.getCount();

    const completed = await query
      .andWhere('booking.status = :status', { status: BookingStatus.COMPLETED })
      .getCount();

    const cancelled = await query
      .andWhere('booking.status = :status', { status: BookingStatus.CANCELLED })
      .getCount();

    const revenue = await query
      .select('SUM(booking.final_price)', 'total')
      .andWhere('booking.payment_status = :paymentStatus', { paymentStatus: 'paid' })
      .getRawOne();

    return {
      total,
      completed,
      cancelled,
      revenue: parseFloat(revenue?.total || '0'),
    };
  }

  async getRevenueByPeriod(queryDto: AnalyticsQueryDto) {
    const { startDate, endDate, period = PeriodType.MONTHLY } = queryDto;

    let groupBy: string;
    let dateFormat: string;

    switch (period) {
      case PeriodType.DAILY:
        groupBy = 'DATE(booking.booking_date)';
        dateFormat = '%Y-%m-%d';
        break;
      case PeriodType.WEEKLY:
        groupBy = 'YEARWEEK(booking.booking_date)';
        dateFormat = '%Y-W%u';
        break;
      case PeriodType.MONTHLY:
        groupBy = 'DATE_FORMAT(booking.booking_date, "%Y-%m")';
        dateFormat = '%Y-%m';
        break;
      case PeriodType.YEARLY:
        groupBy = 'YEAR(booking.booking_date)';
        dateFormat = '%Y';
        break;
    }

    const query = this.bookingRepository
      .createQueryBuilder('booking')
      .select(`DATE_FORMAT(booking.booking_date, '${dateFormat}')`, 'period')
      .addSelect('COUNT(booking.id)', 'bookingCount')
      .addSelect('SUM(booking.final_price)', 'revenue')
      .addSelect('AVG(booking.final_price)', 'averageValue')
      .where('booking.payment_status = :paymentStatus', { paymentStatus: 'paid' })
      .groupBy(groupBy)
      .orderBy('period', 'ASC');

    if (startDate && endDate) {
      query.andWhere('booking.booking_date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    return query.getRawMany();
  }

  async getTopVenues(limit: number = 10): Promise<any[]> {
    return this.venueRepository
      .createQueryBuilder('venue')
      .select('venue.id', 'id')
      .addSelect('venue.venue_name', 'venueName')
      .addSelect('venue.total_bookings', 'totalBookings')
      .addSelect('venue.rating_average', 'ratingAverage')
      .orderBy('venue.total_bookings', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  async getVenuePerformance(venueId: string, queryDto: AnalyticsQueryDto) {
    const { startDate, endDate } = queryDto;

    const bookingsQuery = this.bookingRepository
      .createQueryBuilder('booking')
      .innerJoin('booking.court', 'court')
      .where('court.venue_id = :venueId', { venueId });

    if (startDate && endDate) {
      bookingsQuery.andWhere('booking.booking_date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const totalBookings = await bookingsQuery.getCount();

    const completedBookings = await bookingsQuery
      .andWhere('booking.status = :status', { status: BookingStatus.COMPLETED })
      .getCount();

    const revenue = await bookingsQuery
      .select('SUM(booking.final_price)', 'total')
      .andWhere('booking.payment_status = :paymentStatus', { paymentStatus: 'paid' })
      .getRawOne();

    const averageRating = await this.venueRepository
      .createQueryBuilder('venue')
      .select('venue.rating_average', 'rating')
      .where('venue.id = :venueId', { venueId })
      .getRawOne();

    return {
      totalBookings,
      completedBookings,
      completionRate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0,
      revenue: parseFloat(revenue?.total || '0'),
      averageRating: parseFloat(averageRating?.rating || '0'),
    };
  }

  async getOwnerDashboard(ownerId: string) {
    // Total venues
    const totalVenues = await this.venueRepository.count({
      where: { ownerId },
    });

    // Total bookings
    const totalBookings = await this.bookingRepository
      .createQueryBuilder('booking')
      .innerJoin('booking.court', 'court')
      .innerJoin('court.venue', 'venue')
      .where('venue.owner_id = :ownerId', { ownerId })
      .getCount();

    // Total revenue
    const revenue = await this.paymentRepository
      .createQueryBuilder('payment')
      .innerJoin('payment.booking', 'booking')
      .innerJoin('booking.court', 'court')
      .innerJoin('court.venue', 'venue')
      .where('venue.owner_id = :ownerId', { ownerId })
      .andWhere('payment.status = :status', { status: PaymentStatus.SUCCESS })
      .select('SUM(payment.amount)', 'total')
      .getRawOne();

    // Pending commission
    const pendingCommission = await this.commissionRepository
      .createQueryBuilder('commission')
      .where('commission.owner_id = :ownerId', { ownerId })
      .andWhere('commission.status = :status', { status: 'approved' })
      .select('SUM(commission.owner_receives)', 'total')
      .getRawOne();

    return {
      totalVenues,
      totalBookings,
      totalRevenue: parseFloat(revenue?.total || '0'),
      pendingCommission: parseFloat(pendingCommission?.total || '0'),
    };
  }

  async getAdminDashboard() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Total users
    const totalUsers = await this.bookingRepository.query(
      'SELECT COUNT(DISTINCT user_id) as count FROM bookings',
    );

    // Monthly bookings
    const monthlyBookings = await this.bookingRepository.count({
      where: {
        bookingDate: Between(startOfMonth, endOfMonth),
      },
    });

    // Monthly revenue
    const monthlyRevenue = await this.paymentRepository
      .createQueryBuilder('payment')
      .where('payment.paid_at BETWEEN :start AND :end', {
        start: startOfMonth,
        end: endOfMonth,
      })
      .andWhere('payment.status = :status', { status: PaymentStatus.SUCCESS })
      .select('SUM(payment.amount)', 'total')
      .getRawOne();

    // Total venues
    const totalVenues = await this.venueRepository.count();

    return {
      totalUsers: totalUsers[0]?.count || 0,
      monthlyBookings,
      monthlyRevenue: parseFloat(monthlyRevenue?.total || '0'),
      totalVenues,
    };
  }
}