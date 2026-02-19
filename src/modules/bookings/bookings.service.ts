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
        const customerEntity = booking.customers || booking.users;

        return {
            ...booking,
            id: booking.id,
            bookingCode: booking.booking_code,
            customerId: booking.customer_id,
            courtId: booking.court_id,
            venueId: booking.venue_id,
            bookingDate: booking.booking_date,
            startTime: booking.start_time,
            endTime: booking.end_time,
            status: booking.status,
            totalHours: Number(booking.total_hours),
            pricePerHour: Number(booking.price_per_hour),
            totalAmount: Number(booking.total_amount),
            createdAt: booking.created_at,
            customer: customerEntity ? this.mapUser(customerEntity) : undefined,
            venue: booking.venues ? this.mapVenue(booking.venues) : undefined,
            court: booking.courts ? this.mapCourt(booking.courts) : undefined,
        };
    }

    private mapUser(user: any) {
        return { id: user.id, fullName: user.full_name, email: user.email, phone: user.phone };
    }

    private mapVenue(venue: any) {
        return { id: venue.id, name: venue.name };
    }

    private mapCourt(court: any) {
        return { id: court.id, name: court.name };
    }

    async findAll(filter: BookingFilterDto) {
        const { page = 1, limit = 10, status, venueId } = filter;
        const [items, total] = await Promise.all([
            this.prisma.bookings.findMany({
                where: { status: status as any, venue_id: venueId },
                include: { customers: true, venues: true, courts: true } as any,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { created_at: 'desc' }
            }),
            this.prisma.bookings.count({ where: { status: status as any, venue_id: venueId } }),
        ]);
        return { items: items.map(b => this.mapBooking(b)), meta: { total, page, limit } };
    }

    async findOne(id: string) {
        const booking = await this.prisma.bookings.findUnique({
            where: { id },
            include: { customers: true, venues: true, courts: true } as any
        });
        if (!booking) throw new NotFoundException('Booking not found');
        return this.mapBooking(booking);
    }

    async updateStatus(id: string, status: string, reason?: string) {
        return this.prisma.bookings.update({
            where: { id },
            data: { status: status as any, cancellation_reason: reason }
        });
    }

    async findAllByUser(userId: string, filter: BookingFilterDto) {
        const items = await this.prisma.bookings.findMany({
            where: { customer_id: userId },
            include: { venues: true, courts: true } as any,
            orderBy: { created_at: 'desc' }
        });
        return items.map(b => this.mapBooking(b));
    }

    async findOneByUser(userId: string, id: string) {
        const booking = await this.prisma.bookings.findFirst({
            where: { id, customer_id: userId },
            include: { venues: true, courts: true } as any
        });
        if (!booking) throw new NotFoundException('Booking not found');
        return this.mapBooking(booking);
    }

    async createBooking(userId: string, data: any) {
        const booking = await this.prisma.bookings.create({
            data: {
                customer_id: userId,
                court_id: data.courtId,
                venue_id: data.venueId,
                booking_date: new Date(data.bookingDate),
                start_time: data.startTime,
                end_time: data.endTime,
                price_per_hour: data.pricePerHour,
                total_amount: data.totalAmount,
                total_hours: data.totalHours || 1,
                status: data.status || 'PENDING',
                booking_code: `BK${Date.now()}`
            }
        });
        return this.mapBooking(booking);
    }

    async cancelByUser(userId: string, id: string, reason: string) {
        return this.updateStatus(id, 'CANCELLED', reason);
    }

    async rescheduleBooking(userId: string, id: string, data: any) {
        return this.prisma.bookings.update({
            where: { id },
            data: { booking_date: new Date(data.bookingDate), start_time: data.startTime, end_time: data.endTime }
        });
    }

    async requestInvoice(userId: string, id: string, data: any) {
        return { success: true };
    }

    async processRefund(id: string, amount: number) {
        return { success: true };
    }

    async createWalkIn(ownerId: string, data: any) {
        return this.createBooking(data.customerId || ownerId, data);
    }

    async updateStatusByOwner(ownerId: string, id: string, status: string, reason?: string) {
        return this.updateStatus(id, status, reason);
    }

    async findAllByOwner(ownerId: string, filter: BookingFilterDto) {
        const items = await this.prisma.bookings.findMany({
            where: { venues: { owner_id: ownerId } },
            include: { customers: true, venues: true, courts: true } as any
        });
        return items.map(b => this.mapBooking(b));
    }

    async findAllForVenues(venueIds: string[], filter: BookingFilterDto) {
        const items = await this.prisma.bookings.findMany({
            where: { venue_id: { in: venueIds } },
            include: { customers: true, venues: true, courts: true } as any
        });
        return items.map(b => this.mapBooking(b));
    }
}
