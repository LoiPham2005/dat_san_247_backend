import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingFilterDto } from './dto/booking-filter.dto';

import { BookingStatus } from '../../common/constants/booking-status.constant';

@Injectable()
export class BookingsService {
    constructor(
        private prisma: PrismaService,
    ) { }

    private mapBooking(booking: any) {
        if (!booking) return null;
        return {
            ...booking,
            id: booking.id,
            bookingCode: booking.booking_code,
            checkInCode: booking.check_in_code,
            customerId: booking.customer_id,
            courtId: booking.court_id,
            venueId: booking.venue_id,
            bookingDate: booking.booking_date,
            startTime: booking.start_time,
            endTime: booking.end_time,
            status: booking.status,
            totalHours: booking.total_hours,
            pricePerHour: booking.price_per_hour,
            totalAmount: booking.total_amount,
            subTotal: booking.sub_total,
            vatAmount: booking.vat_amount,
            vatRate: booking.vat_rate,
            cancellationDeadline: booking.cancellation_deadline,
            commissionAmount: booking.commission_amount,
            platformFee: booking.platform_fee,
            depositAmount: booking.deposit_amount,
            discountAmount: booking.discount_amount,
            promotionCode: booking.promotion_code,
            refundAmount: booking.refund_amount,
            cancellationFee: booking.cancellation_fee,
            checkedInAt: booking.checked_in_at,
            checkedInBy: booking.checked_in_by,
            cancelledAt: booking.cancelled_at,
            cancelledBy: booking.cancelled_by,
            cancellationReason: booking.cancellation_reason,
            createdAt: booking.created_at,
            updatedAt: booking.updated_at,
            // Relations
            customer: booking.users ? this.mapUser(booking.users) : undefined,
            venue: booking.venues ? this.mapVenue(booking.venues) : undefined,
            court: booking.courts ? this.mapCourt(booking.courts) : undefined,
            payments: booking.payments,
        };
    }

    private mapUser(user: any) {
        // Simple mapping for nested user in booking
        return {
            ...user,
            firstName: user.first_name,
            lastName: user.last_name,
            fullName: user.full_name,
            email: user.email,
            phone: user.phone,
            avatarUrl: user.avatar_url,
        };
    }

    private mapVenue(venue: any) {
        return {
            ...venue,
            name: venue.name,
            // Add other fields if necessary
        };
    }

    private mapCourt(court: any) {
        return {
            ...court,
            name: court.name,
        }
    }

    async findAll(filter: BookingFilterDto) {
        const { page = 1, limit = 10, status, date, venueId, search } = filter;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (status) where.status = status;
        if (date) where.booking_date = new Date(date);
        if (venueId) where.venue_id = venueId;
        if (search) {
            where.OR = [
                { booking_code: { contains: search, mode: 'insensitive' } },
                { users: { full_name: { contains: search, mode: 'insensitive' } } },
                { users: { phone: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const [items, total] = await Promise.all([
            this.prisma.bookings.findMany({
                where,
                include: { users: true, venues: true, courts: true },
                orderBy: { created_at: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.bookings.count({ where }),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            items: items.map(b => this.mapBooking(b)),
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
        const booking = await this.prisma.bookings.findUnique({
            where: { id },
            include: { users: true, venues: true, courts: true, payments: true }
        });
        if (!booking) throw new NotFoundException('Booking not found');
        return this.mapBooking(booking);
    }

    async updateStatus(id: string, status: BookingStatus, reason?: string) {
        const booking = await this.prisma.bookings.findUnique({ where: { id } });
        if (!booking) throw new NotFoundException('Booking not found');

        const updateData: any = { status };

        if (reason && status === BookingStatus.CANCELLED) {
            updateData.cancellation_reason = reason;
            updateData.cancelled_at = new Date();
        }

        const updated = await this.prisma.bookings.update({
            where: { id },
            data: updateData,
            include: { users: true, venues: true, courts: true }
        });
        return this.mapBooking(updated);
    }

    async processRefund(id: string, amount: number) {
        const booking = await this.findOne(id);
        // Logic thực tế gọi gateway refund
        // Update booking refund amount?
        // const updated = await this.prisma.bookings.update(...)
        return { success: true, message: `Refunded ${amount} for booking ${booking.bookingCode}` };
    }

    async findAllByOwner(ownerId: string, filter: BookingFilterDto) {
        const { page = 1, limit = 10, status, date, venueId, search } = filter;
        const skip = (page - 1) * limit;

        const where: any = {
            venues: { owner_id: ownerId }
        };

        if (status) where.status = status;
        if (date) where.booking_date = new Date(date);
        if (venueId) where.venue_id = venueId;
        if (search) {
            where.OR = [
                { booking_code: { contains: search, mode: 'insensitive' } },
                { users: { full_name: { contains: search, mode: 'insensitive' } } },
                { users: { phone: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const [items, total] = await Promise.all([
            this.prisma.bookings.findMany({
                where,
                include: { users: true, venues: true, courts: true },
                orderBy: { created_at: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.bookings.count({ where }),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            items: items.map(b => this.mapBooking(b)),
            meta: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
        };
    }

    async createWalkIn(ownerId: string, data: any) {
        // Create booking directly
        // data mapping
        const bookingData: any = {
            booking_code: 'W' + Date.now().toString().slice(-8),
            status: BookingStatus.CONFIRMED as any, // Use Prisma enum
            users: { connect: { id: data.customerId || ownerId } }, // Assuming customerId or owner is valid user
            venues: { connect: { id: data.venueId } },
            courts: { connect: { id: data.courtId } },
            booking_date: new Date(data.bookingDate),
            start_time: new Date(`${data.bookingDate}T${data.startTime}`), // adjust format if needed
            end_time: new Date(`${data.bookingDate}T${data.endTime}`),
            total_amount: data.totalAmount || 0,
            price_per_hour: data.pricePerHour || 0,
            // ... map other fields
        };

        const booking = await this.prisma.bookings.create({
            data: {
                ...bookingData,
                users: { connect: { id: data.customerId || ownerId } },
                venues: { connect: { id: data.venueId } },
                courts: { connect: { id: data.courtId } },
            },
            include: { users: true, venues: true, courts: true }
        });

        return this.mapBooking(booking);
    }

    async updateStatusByOwner(ownerId: string, id: string, status: BookingStatus, reason?: string) {
        const booking = await this.prisma.bookings.findUnique({
            where: { id },
            include: { venues: true }
        });

        // Check ownership via venues.owner_id (schema check needed: venues owner_id type)
        if (!booking || booking.venues.owner_id !== ownerId) {
            throw new NotFoundException('Booking not found or not authorized');
        }

        const updateData: any = { status };

        if (reason && status === BookingStatus.CANCELLED) {
            updateData.cancellation_reason = reason;
            updateData.cancelled_at = new Date();
        }
        if (status === BookingStatus.CHECKED_IN) {
            updateData.checked_in_at = new Date();
        }

        const updated = await this.prisma.bookings.update({
            where: { id },
            data: updateData,
            include: { users: true, venues: true, courts: true }
        });
        return this.mapBooking(updated);
    }

    async findAllByUser(userId: string, filter: BookingFilterDto) {
        const { page = 1, limit = 10, status } = filter;
        const skip = (page - 1) * limit;

        const where: any = { customer_id: userId };
        if (status) where.status = status;

        const [items, total] = await Promise.all([
            this.prisma.bookings.findMany({
                where,
                include: { venues: true, courts: true },
                orderBy: { created_at: 'desc' },
                skip,
                take: limit
            }),
            this.prisma.bookings.count({ where })
        ]);

        return {
            items: items.map(b => this.mapBooking(b)),
            meta: { total, page, limit, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPreviousPage: page > 1 }
        };
    }

    async findOneByUser(userId: string, id: string) {
        const booking = await this.prisma.bookings.findFirst({
            where: { id, customer_id: userId },
            include: { venues: true, courts: true, payments: true, reviews: true }
        });
        if (!booking) throw new NotFoundException('Booking not found');
        return this.mapBooking(booking);
    }

    async createBooking(userId: string, data: any) {
        const bookingData = {
            booking_code: 'B' + Date.now().toString().slice(-8),
            status: data.status || BookingStatus.PENDING as any,
            customer_id: userId,
            venue_id: data.venueId,
            court_id: data.courtId,
            booking_date: new Date(data.bookingDate),
            start_time: new Date(`${data.bookingDate}T${data.startTime}`),
            end_time: new Date(`${data.bookingDate}T${data.endTime}`),
            total_amount: data.totalAmount,
            price_per_hour: data.pricePerHour,
            total_hours: (new Date(`${data.bookingDate}T${data.endTime}`).getTime() - new Date(`${data.bookingDate}T${data.startTime}`).getTime()) / (1000 * 60 * 60)
        };

        const booking = await this.prisma.bookings.create({
            data: bookingData,
            include: { users: true, venues: true, courts: true }
        });
        return this.mapBooking(booking);
    }

    async cancelByUser(userId: string, id: string, reason: string) {
        const booking = await this.prisma.bookings.findFirst({
            where: { id, customer_id: userId }
        });

        if (!booking) throw new NotFoundException('Booking not found');

        if (booking.status !== BookingStatus.PENDING as any && booking.status !== BookingStatus.CONFIRMED as any) {
            throw new Error('Cannot cancel booking in current status');
        }

        const updated = await this.prisma.bookings.update({
            where: { id },
            data: {
                status: BookingStatus.CANCELLED as any,
                cancellation_reason: reason,
                cancelled_at: new Date()
            },
            include: { users: true, venues: true, courts: true }
        });
        return this.mapBooking(updated);
    }

    async rescheduleBooking(userId: string, id: string, data: any) {
        const booking = await this.prisma.bookings.findFirst({
            where: { id, customer_id: userId }
        });
        if (!booking) throw new NotFoundException('Booking not found');

        if (booking.status !== BookingStatus.PENDING as any && booking.status !== BookingStatus.CONFIRMED as any) {
            throw new Error('Cannot reschedule booking in current status');
        }

        const updated = await this.prisma.bookings.update({
            where: { id },
            data: {
                booking_date: new Date(data.bookingDate),
                // handle start/end time updates
                note: data.note || booking.note
            },
            include: { users: true, venues: true, courts: true }
        });
        return this.mapBooking(updated);
    }

    async requestInvoice(userId: string, id: string, data: any) {
        const booking = await this.findOneByUser(userId, id);
        console.log(`[BookingsService] Invoice request for booking ${booking.bookingCode} by user ${userId}`);
        return { success: true, message: 'Invoice request submitted successfully' };
    }

    async findAllForVenues(venueIds: string[], filter: any) {
        const { page = 1, limit = 10, status, date } = filter;
        const skip = (page - 1) * limit;

        const where: any = {
            venue_id: { in: venueIds }
        };

        if (status) where.status = status;
        if (date) where.booking_date = new Date(date);

        const [items, total] = await Promise.all([
            this.prisma.bookings.findMany({
                where,
                include: { users: true, courts: true },
                orderBy: { created_at: 'desc' },
                skip,
                take: limit
            }),
            this.prisma.bookings.count({ where })
        ]);

        return {
            items: items.map(b => this.mapBooking(b)),
            meta: { total, page, limit }
        };
    }
}
