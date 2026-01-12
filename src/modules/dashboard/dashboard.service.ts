import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Venue } from '../venues/entities/venue.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { Payment } from '../payments/entities/payment.entity';
import { UserRole } from '../../common/constants/role.constant';
import { BookingStatus } from '../../common/constants/booking-status.constant';

@Injectable()
export class DashboardService {
    constructor(private dataSource: DataSource) { }

    async getSuperAdminOverview() {
        const userCount = await this.dataSource.getRepository(User).count();
        const venueCount = await this.dataSource.getRepository(Venue).count();

        const revenueResult = await this.dataSource.getRepository(Payment)
            .createQueryBuilder('payment')
            .select('SUM(payment.amount)', 'total')
            .where('payment.status = :status', { status: 'PAID' })
            .getRawOne();

        const bookingToday = await this.dataSource.getRepository(Booking).count({
            where: { bookingDate: new Date() } // Đơn giản hóa, thực tế cần xử lý timezone
        });

        return {
            totalUsers: userCount,
            activeVenues: venueCount,
            totalRevenue: parseFloat(revenueResult?.total || 0),
            bookingsToday: bookingToday,
        };
    }

    async getRevenueChartData() {
        // Logic lấy doanh thu theo tháng/ngày
        return [
            { date: '2024-01', revenue: 10000000 },
            { date: '2024-02', revenue: 15000000 },
        ];
    }

    async getTopVenues() {
        return this.dataSource.getRepository(Venue)
            .createQueryBuilder('venue')
            .leftJoin('venue.bookings', 'booking')
            .select(['venue.id', 'venue.name'])
            .addSelect('SUM(booking.totalAmount)', 'totalRevenue')
            .groupBy('venue.id')
            .orderBy('totalRevenue', 'DESC')
            .limit(10)
            .getRawMany();
    }

    async getTopCustomers() {
        return this.dataSource.getRepository(User)
            .createQueryBuilder('user')
            .leftJoin('user.bookings', 'booking')
            .select(['user.id', 'user.fullName', 'user.email'])
            .addSelect('COUNT(booking.id)', 'totalBookings')
            .where('user.role = :role', { role: UserRole.CUSTOMER })
            .groupBy('user.id')
            .orderBy('totalBookings', 'DESC')
            .limit(10)
            .getRawMany();
    }

    async getRecentActivities() {
        // Trả về log hoặc booking mới nhất
        return [];
    }

    async getOwnerOverview(ownerId: string) {
        const venues = await this.dataSource.getRepository(Venue).find({ where: { ownerId } });
        const venueIds = venues.map(v => v.id);

        if (venueIds.length === 0) {
            return { totalRevenue: 0, bookingCount: 0, occupancyRate: 0, averageRating: 0 };
        }

        const revenueResult = await this.dataSource.getRepository(Payment)
            .createQueryBuilder('payment')
            .innerJoin('payment.booking', 'booking')
            .select('SUM(payment.amount)', 'total')
            .where('booking.venueId IN (:...venueIds)', { venueIds })
            .andWhere('payment.status = :status', { status: 'PAID' })
            .getRawOne();

        const bookingStats = await this.dataSource.getRepository(Booking)
            .createQueryBuilder('booking')
            .select('status')
            .addSelect('COUNT(id)', 'count')
            .where('booking.venueId IN (:...venueIds)', { venueIds })
            .groupBy('status')
            .getRawMany();

        const avgRating = venues.reduce((acc, v) => acc + Number(v.rating), 0) / venues.length;

        return {
            totalRevenue: parseFloat(revenueResult?.total || 0),
            bookingStats,
            averageRating: avgRating,
        };
    }

    async getOwnerRevenueChart(ownerId: string) {
        // Logic thực tế query doanh thu theo ngày/tháng cho các sân của owner
        return [];
    }

    async getUpcomingBookings(ownerId: string) {
        return this.dataSource.getRepository(Booking)
            .createQueryBuilder('booking')
            .innerJoinAndSelect('booking.court', 'court')
            .innerJoinAndSelect('booking.venue', 'venue')
            .where('venue.ownerId = :ownerId', { ownerId })
            .andWhere('booking.bookingDate >= :today', { today: new Date() })
            .andWhere('booking.status IN (:...statuses)', { statuses: [BookingStatus.CONFIRMED, BookingStatus.PENDING] })
            .orderBy('booking.bookingDate', 'ASC')
            .addOrderBy('booking.startTime', 'ASC')
            .limit(10)
            .getMany();
    }

    async getVenueStaffOverview(venueIds: string[]) {
        if (venueIds.length === 0) return { todayBookings: 0, pendingCheckins: 0 };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const stats = await this.dataSource.getRepository(Booking)
            .createQueryBuilder('booking')
            .select('COUNT(id)', 'total')
            .addSelect("COUNT(CASE WHEN status = 'CONFIRMED' THEN 1 END)", 'pending')
            .where('booking.venueId IN (:...venueIds)', { venueIds })
            .andWhere('booking.bookingDate = :today', { today })
            .getRawOne();

        return {
            todayBookings: parseInt(stats?.total || 0),
            pendingCheckins: parseInt(stats?.pending || 0),
        };
    }
}
