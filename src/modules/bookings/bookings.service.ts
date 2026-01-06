import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { BookingFilterDto } from './dto/booking-filter.dto';
import { BookingStatus } from '../../common/constants/booking-status.constant';

@Injectable()
export class BookingsService {
    constructor(
        @InjectRepository(Booking)
        private bookingRepository: Repository<Booking>,
    ) { }

    async findAll(filter: BookingFilterDto) {
        const { page = 1, limit = 10, status, date, venueId, search } = filter;
        const skip = (page - 1) * limit;

        const query = this.bookingRepository.createQueryBuilder('booking')
            .leftJoinAndSelect('booking.customer', 'customer')
            .leftJoinAndSelect('booking.venue', 'venue')
            .leftJoinAndSelect('booking.court', 'court');

        if (status) query.andWhere('booking.status = :status', { status });
        if (date) query.andWhere('booking.bookingDate = :date', { date });
        if (venueId) query.andWhere('booking.venueId = :venueId', { venueId });
        if (search) {
            query.andWhere(
                '(booking.bookingCode ILIKE :search OR customer.fullName ILIKE :search OR customer.phone ILIKE :search)',
                { search: `%${search}%` },
            );
        }

        const [items, total] = await query
            .orderBy('booking.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        const totalPages = Math.ceil(total / limit);

        return {
            items,
            meta: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        };
    }

    async findOne(id: string) {
        const booking = await this.bookingRepository.findOne({
            where: { id },
            relations: ['customer', 'venue', 'court', 'payments']
        });
        if (!booking) throw new NotFoundException('Booking not found');
        return booking;
    }

    async updateStatus(id: string, status: BookingStatus, reason?: string) {
        const booking = await this.findOne(id);
        booking.status = status;
        if (reason && status === BookingStatus.CANCELLED) {
            booking.cancellationReason = reason;
            booking.cancelledAt = new Date();
        }
        return this.bookingRepository.save(booking);
    }

    async processRefund(id: string, amount: number) {
        // Logic thực tế gọi gateway refund
        const booking = await this.findOne(id);
        // Cập nhật trạng thái thanh toán liên quan
        return { success: true, message: `Refunded ${amount} for booking ${booking.bookingCode}` };
    }

    async findAllByOwner(ownerId: string, filter: BookingFilterDto) {
        const { page = 1, limit = 10, status, date, venueId, search } = filter;
        const skip = (page - 1) * limit;

        const query = this.bookingRepository.createQueryBuilder('booking')
            .innerJoin('booking.venue', 'venue')
            .leftJoinAndSelect('booking.customer', 'customer')
            .leftJoinAndSelect('booking.court', 'court')
            .where('venue.ownerId = :ownerId', { ownerId });

        if (status) query.andWhere('booking.status = :status', { status });
        if (date) query.andWhere('booking.bookingDate = :date', { date });
        if (venueId) query.andWhere('booking.venueId = :venueId', { venueId });
        if (search) {
            query.andWhere(
                '(booking.bookingCode ILIKE :search OR customer.fullName ILIKE :search OR customer.phone ILIKE :search)',
                { search: `%${search}%` },
            );
        }

        const [items, total] = await query
            .orderBy('booking.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        const totalPages = Math.ceil(total / limit);

        return {
            items,
            meta: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
        };
    }

    async createWalkIn(ownerId: string, data: any) {
        // Logic tạo booking trực tiếp
        const booking = this.bookingRepository.create({
            ...data,
            status: BookingStatus.CONFIRMED,
            bookingCode: 'W' + Date.now().toString().slice(-8),
        });
        return this.bookingRepository.save(booking);
    }

    async updateStatusByOwner(ownerId: string, id: string, status: BookingStatus, reason?: string) {
        const booking = await this.bookingRepository.findOne({
            where: { id },
            relations: ['venue']
        });
        if (!booking || booking.venue.ownerId !== ownerId) {
            throw new NotFoundException('Booking not found or not authorized');
        }
        booking.status = status;
        if (reason && status === BookingStatus.CANCELLED) {
            booking.cancellationReason = reason;
            booking.cancelledAt = new Date();
        }
        if (status === BookingStatus.CHECKED_IN) {
            booking.checkedInAt = new Date();
        }
        return this.bookingRepository.save(booking);
    }

    async findAllByUser(userId: string, filter: BookingFilterDto) {
        const { page = 1, limit = 10, status } = filter;
        const skip = (page - 1) * limit;

        const query = this.bookingRepository.createQueryBuilder('booking')
            .leftJoinAndSelect('booking.venue', 'venue')
            .leftJoinAndSelect('booking.court', 'court')
            .where('booking.customerId = :userId', { userId });

        if (status) query.andWhere('booking.status = :status', { status });

        const [items, total] = await query
            .orderBy('booking.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        return {
            items,
            meta: { total, page, limit }
        };
    }

    async findOneByUser(userId: string, id: string) {
        const booking = await this.bookingRepository.findOne({
            where: { id, customerId: userId },
            relations: ['venue', 'court', 'payments', 'reviews']
        });
        if (!booking) throw new NotFoundException('Booking not found');
        return booking;
    }

    async createBooking(userId: string, data: any) {
        const booking = this.bookingRepository.create({
            ...data,
            customerId: userId,
            status: BookingStatus.PENDING,
            bookingCode: 'B' + Date.now().toString().slice(-8),
        });
        return this.bookingRepository.save(booking);
    }

    async cancelByUser(userId: string, id: string, reason: string) {
        const booking = await this.findOneByUser(userId, id);
        if (booking.status !== BookingStatus.PENDING && booking.status !== BookingStatus.CONFIRMED) {
            throw new Error('Cannot cancel booking in current status');
        }
        booking.status = BookingStatus.CANCELLED;
        booking.cancellationReason = reason;
        booking.cancelledAt = new Date();
        return this.bookingRepository.save(booking);
    }

    async findAllForVenues(venueIds: string[], filter: any) {
        const { page = 1, limit = 10, status, date } = filter;
        const skip = (page - 1) * limit;

        const query = this.bookingRepository.createQueryBuilder('booking')
            .leftJoinAndSelect('booking.customer', 'customer')
            .leftJoinAndSelect('booking.court', 'court')
            .where('booking.venueId IN (:...venueIds)', { venueIds });

        if (status) query.andWhere('booking.status = :status', { status });
        if (date) query.andWhere('booking.bookingDate = :date', { date });

        const [items, total] = await query
            .orderBy('booking.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        return {
            items,
            meta: { total, page, limit }
        };
    }
}
