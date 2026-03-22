import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreateRecurringDto } from './dto/create-recurring.dto';
import { BookingStatus, PaymentStatus, PaymentMethod, DayOfWeek, RecurringType } from '@prisma/client';
import { QueryBookingsDto } from './dto/query-bookings.dto';

@Injectable()
export class BookingsService {
    constructor(private prisma: PrismaService) { }

    async getAdminBookings(query: QueryBookingsDto) {
        const { page = 1, limit = 10, search, status, payment_status, venue_id, start_date, end_date } = query;
        const skip = (page - 1) * limit;

        const where: any = {
            ...(status && { status }),
            ...(payment_status && { payment_status }),
            ...(venue_id && { venue_id }),
            ...((start_date || end_date) && {
                booking_date: {
                    ...(start_date && { gte: new Date(start_date) }),
                    ...(end_date && { lte: new Date(end_date) })
                }
            }),
            ...(search && {
                OR: [
                    { booking_code: { contains: search, mode: 'insensitive' } },
                    { customers: { full_name: { contains: search, mode: 'insensitive' } } },
                    { venues: { name: { contains: search, mode: 'insensitive' } } }
                ]
            })
        };

        const [items, total] = await Promise.all([
            this.prisma.bookings.findMany({
                where,
                skip,
                take: limit,
                include: {
                    customers: true,
                    venues: true,
                    courts: true,
                    booking_addons: {
                        include: { venue_services: true }
                    }
                },
                orderBy: { created_at: 'desc' }
            }),
            this.prisma.bookings.count({ where })
        ]);

        return {
            items: items.map(b => ({
                id: b.id,
                booking_code: b.booking_code,
                customer_name: b.customers.full_name,
                customer_email: b.customers.email,
                customer_phone: b.customers.phone || 'N/A',
                venue_name: b.venues.name,
                court_name: b.courts.name,
                booking_date: b.booking_date.toISOString().split('T')[0],
                start_time: b.start_time.toISOString().substring(11, 16),
                end_time: b.end_time.toISOString().substring(11, 16),
                total_amount: Number(b.total_amount),
                status: b.status,
                payment_status: b.payment_status,
                payment_method: b.payment_method,
                created_at: b.created_at,
                addons: b.booking_addons.map(a => ({
                    id: a.id,
                    name: a.venue_services.name,
                    quantity: a.quantity,
                    price: Number(a.total_price)
                }))
            })),
            total
        };
    }

    async createRecurringBooking(userId: string, data: CreateRecurringDto) {
        // 1. Verify venue & court
        const venue = await this.prisma.venues.findUnique({ where: { id: data.venue_id } });
        if (!venue) throw new NotFoundException('Không tìm thấy cơ sở');

        const court = await this.prisma.courts.findUnique({ where: { id: data.court_id } });
        if (!court) throw new NotFoundException('Không tìm thấy sân');

        // Convert string time "18:00" to Date
        const startAt = new Date(`1970-01-01T${data.start_time}:00Z`);
        const endAt = new Date(`1970-01-01T${data.end_time}:00Z`);

        return await this.prisma.recurring_bookings.create({
            data: {
                user_id: userId,
                venue_id: data.venue_id,
                court_id: data.court_id,
                repeat_type: data.repeat_type,
                start_time: startAt,
                end_time: endAt,
                start_date: new Date(data.start_date),
                end_date: data.end_date ? new Date(data.end_date) : null,
                is_active: true,
                recurring_days: {
                    create: (data.days || []).map(day => ({ day_of_week: day }))
                }
            },
            include: {
                recurring_days: true
            }
        });
    }

    async createBooking(userId: string, data: CreateBookingDto) {
        // 1. Verify venue
        const venue = await this.prisma.venues.findUnique({
            where: { id: data.venue_id }
        });
        if (!venue) throw new NotFoundException('Không tìm thấy cơ sở');

        // 2. Process and Merge Slots
        const itemsByCourt: Record<string, typeof data.items> = {};
        data.items.forEach(item => {
            if (!itemsByCourt[item.court_id]) itemsByCourt[item.court_id] = [];
            itemsByCourt[item.court_id].push(item);
        });

        const mergedItems: typeof data.items = [];

        for (const courtId in itemsByCourt) {
            const items = itemsByCourt[courtId].sort((a, b) => a.start_time.localeCompare(b.start_time));

            let current = { ...items[0] };
            for (let i = 1; i < items.length; i++) {
                const next = items[i];
                if (next.start_time === current.end_time) {
                    current.end_time = next.end_time;
                } else {
                    mergedItems.push(current);
                    current = { ...next };
                }
            }
            mergedItems.push(current);
        }

        // 3. Create bookings in transaction
        return await this.prisma.$transaction(async (tx) => {
            const results: any[] = [];

            for (const item of mergedItems) {
                const court = await tx.courts.findUnique({
                    where: { id: item.court_id }
                });

                if (!court) throw new BadRequestException(`Sân ${item.court_id} không tồn tại`);

                const startAt = new Date(`1970-01-01T${item.start_time}:00Z`);
                const endAt = new Date(`1970-01-01T${item.end_time}:00Z`);

                const overlap = await tx.bookings.findFirst({
                    where: {
                        court_id: item.court_id,
                        booking_date: new Date(data.booking_date),
                        status: { not: BookingStatus.CANCELLED },
                        OR: [
                            { start_time: { lt: endAt }, end_time: { gt: startAt } }
                        ]
                    }
                });

                if (overlap) {
                    throw new BadRequestException(`Sân ${court.name} đã bị trùng lịch trong khoảng ${item.start_time} - ${item.end_time}`);
                }

                const bookingCode = `BK${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
                const checkInCode = Math.floor(100000 + Math.random() * 900000).toString();

                const hours = (endAt.getTime() - startAt.getTime()) / (1000 * 60 * 60);
                const subTotal = hours * Number(court.price_per_hour);

                const booking = await tx.bookings.create({
                    data: {
                        customer_id: userId,
                        venue_id: data.venue_id,
                        court_id: item.court_id,
                        booking_date: new Date(data.booking_date),
                        start_time: startAt,
                        end_time: endAt,
                        booking_code: bookingCode,
                        check_in_code: checkInCode,
                        status: BookingStatus.CONFIRMED,
                        payment_status: PaymentStatus.PAID,
                        payment_method: (data.payment_method as PaymentMethod) || PaymentMethod.WALLET,
                        total_hours: hours,
                        price_per_hour: Number(court.price_per_hour),
                        sub_total: subTotal,
                        total_amount: subTotal,
                        note: data.note
                    },
                    include: {
                        courts: true,
                        venues: true
                    }
                });

                results.push(booking);
            }

            return {
                message: 'Đặt sân thành công!',
                bookings: results
            };
        });
    }

    async getMyBookings(userId: string) {
        const bookings = await this.prisma.bookings.findMany({
            where: { customer_id: userId },
            include: {
                venues: true,
                courts: true,
                booking_addons: {
                    include: {
                        venue_services: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        return bookings.map(b => this._mapBooking(b));
    }

    async getBookingDetail(userId: string, bookingId: string) {
        const b = await this.prisma.bookings.findFirst({
            where: { id: bookingId, customer_id: userId },
            include: {
                venues: true,
                courts: true,
                booking_addons: {
                    include: {
                        venue_services: true
                    }
                }
            }
        });

        if (!b) throw new NotFoundException('Không tìm thấy đơn hàng');
        return this._mapBooking(b);
    }

    private _mapBooking(b: any) {
        return {
            id: b.id,
            booking_code: b.booking_code,
            check_in_code: b.check_in_code,
            venue_id: b.venue_id,
            venue_name: b.venues.name,
            venue_address: b.venues.address,
            court_id: b.court_id,
            court_name: b.courts.name,
            booking_date: b.booking_date.toISOString().split('T')[0],
            start_time: b.start_time.toISOString().substring(11, 16),
            end_time: b.end_time.toISOString().substring(11, 16),
            total_amount: Number(b.total_amount),
            sub_total: Number(b.sub_total),
            deposit_amount: Number(b.deposit_amount),
            status: b.status,
            payment_status: b.payment_status,
            cancellation_reason: b.cancellation_reason,
            created_at: b.created_at,
            addons: (b.booking_addons || []).map(a => ({
                id: a.id,
                service_name: a.venue_services.name,
                quantity: a.quantity,
                total_price: Number(a.total_price)
            }))
        };
    }

    async cancelBooking(userId: string, bookingId: string, reason: string) {
        const booking = await this.prisma.bookings.findFirst({
            where: { id: bookingId, customer_id: userId }
        });

        if (!booking) throw new NotFoundException('Không tìm thấy đơn hàng');
        if (['CANCELLED', 'COMPLETED', 'CHECKED_IN'].includes(booking.status)) {
            throw new BadRequestException('Trạng thái hiện tại không được phép hủy');
        }

        return await this.prisma.bookings.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.CANCELLED,
                cancellation_reason: reason,
                cancelled_at: new Date(),
                cancelled_by: userId
            }
        });
    }

    async getMyWaitlists(userId: string) {
        const waitlists = await this.prisma.booking_waitlist.findMany({
            where: { user_id: userId },
            include: {
                courts: { include: { venues: true } }
            },
            orderBy: { created_at: 'desc' }
        });

        return waitlists.map(w => ({
            id: w.id,
            venue_name: w.courts.venues.name,
            court_name: w.courts.name,
            booking_date: w.booking_date.toISOString().split('T')[0],
            start_time: w.start_time.toISOString().substring(11, 16),
            end_time: w.end_time.toISOString().substring(11, 16),
            priority: w.priority,
            status: w.status,
            created_at: w.created_at
        }));
    }

    async cancelWaitlist(userId: string, waitlistId: string) {
        const waitlist = await this.prisma.booking_waitlist.findFirst({
            where: { id: waitlistId, user_id: userId }
        });

        if (!waitlist) throw new NotFoundException('Không tìm thấy yêu cầu chờ');

        return await this.prisma.booking_waitlist.update({
            where: { id: waitlistId },
            data: { status: 'CANCELLED' }
        });
    }

    async getMyRecurringBookings(userId: string) {
        const recurring = await this.prisma.recurring_bookings.findMany({
            where: { user_id: userId },
            include: {
                venues: true,
                courts: true,
                recurring_days: true
            },
            orderBy: { created_at: 'desc' }
        });

        return recurring.map(r => ({
            id: r.id,
            venue_name: r.venues.name,
            court_name: r.courts.name,
            repeat_type: r.repeat_type,
            days: r.recurring_days.map(d => d.day_of_week),
            start_time: r.start_time.toISOString().substring(11, 16),
            end_time: r.end_time.toISOString().substring(11, 16),
            start_date: r.start_date.toISOString().split('T')[0],
            end_date: r.end_date?.toISOString().split('T')[0],
            is_active: r.is_active
        }));
    }

    // --- OWNER METHODS ---
    private async _verifyVenueAccess(userId: string, venueId: string) {
        let finalVenueId = venueId;
        
        // Handle Mock VN-1
        if (venueId === 'VN-1') {
            const staffRecord = await this.prisma.venue_staff.findFirst({
                where: { user_id: userId, is_active: true }
            });
            if (staffRecord) {
                finalVenueId = staffRecord.venue_id;
            } else {
                 const ownedVenue = await this.prisma.venues.findFirst({
                    where: { owner_id: userId, deleted_at: null }
                });
                if (ownedVenue) {
                    finalVenueId = ownedVenue.id;
                } else {
                    throw new NotFoundException('Bạn không được gán cho bất kỳ cơ sở nào trong hệ thống.');
                }
            }
        }

        const venue = await this.prisma.venues.findUnique({
            where: { id: finalVenueId }
        });

        if (!venue) throw new NotFoundException('Không tìm thấy cơ sở');

        if (venue.owner_id !== userId) {
            const isStaff = await this.prisma.venue_staff.findFirst({
                where: { venue_id: finalVenueId, user_id: userId, is_active: true }
            });
            if (!isStaff) {
                throw new BadRequestException('Bạn không có quyền truy cập cơ sở này');
            }
        }

        return { ...venue, id: finalVenueId };
    }

    async getOwnerBookings(userId: string, venueId: string) {
        const venue = await this._verifyVenueAccess(userId, venueId);

        const bookings = await this.prisma.bookings.findMany({
            where: { venue_id: venue.id },
            include: { customers: true, courts: true },
            orderBy: { created_at: 'desc' }
        });

        return bookings.map(b => ({
            id: b.id,
            booking_code: b.booking_code,
            venue_id: b.venue_id,
            court_id: b.court_id,
            court_name: b.courts.name,
            customer_name: b.customers.full_name,
            customer_phone: b.customers.phone || 'N/A',
            booking_date: b.booking_date.toISOString().split('T')[0],
            start_time: b.start_time.toISOString().substring(11, 16),
            end_time: b.end_time.toISOString().substring(11, 16),
            total_amount: Number(b.total_amount),
            status: b.status,
            payment_status: b.payment_status,
            created_at: b.created_at
        }));
    }

    async ownerUpdateBookingStatus(userId: string, bookingId: string, status: BookingStatus) {
        const booking = await this.prisma.bookings.findUnique({
            where: { id: bookingId },
            include: { venues: true }
        });

        if (!booking) throw new NotFoundException('Không tìm thấy đơn hàng');

        if (booking.venues.owner_id !== userId) {
            const isStaff = await this.prisma.venue_staff.findFirst({
                where: { venue_id: booking.venue_id, user_id: userId, is_active: true }
            });
            if (!isStaff) {
                throw new BadRequestException('Bạn không có quyền cập nhật đơn hàng này');
            }
        }

        return await this.prisma.bookings.update({
            where: { id: bookingId },
            data: { status }
        });
    }

    async getOwnerWaitlist(userId: string, venueId: string) {
        const venue = await this._verifyVenueAccess(userId, venueId);

        const waitlists = await this.prisma.booking_waitlist.findMany({
            where: { courts: { venue_id: venue.id } },
            include: { users: true, courts: true },
            orderBy: { created_at: 'desc' }
        });

        return waitlists.map(w => ({
            id: w.id,
            venue_id: venueId,
            court_name: w.courts.name,
            customer_name: w.users.full_name,
            customer_phone: w.users.phone || 'N/A',
            booking_date: w.booking_date.toISOString().split('T')[0],
            start_time: w.start_time.toISOString().substring(11, 16),
            end_time: w.end_time.toISOString().substring(11, 16),
            status: w.status,
            created_at: w.created_at
        }));
    }

    async getOwnerRecurringBookings(userId: string, venueId: string) {
        const venue = await this._verifyVenueAccess(userId, venueId);

        const recurring = await this.prisma.recurring_bookings.findMany({
            where: { venue_id: venue.id },
            include: { users: true, courts: true },
            orderBy: { created_at: 'desc' }
        });

        return recurring.map(r => ({
            id: r.id,
            venue_id: r.venue_id,
            court_name: r.courts.name,
            customer_name: r.users.full_name,
            customer_phone: r.users.phone || 'N/A',
            repeat_type: r.repeat_type,
            start_date: r.start_date.toISOString().split('T')[0],
            end_date: r.end_date?.toISOString().split('T')[0] || null,
            start_time: r.start_time.toISOString().substring(11, 16),
            end_time: r.end_time.toISOString().substring(11, 16),
            is_active: r.is_active
        }));
    }

    async adminUpdateBookingStatus(bookingId: string, status: BookingStatus) {
        const booking = await this.prisma.bookings.findUnique({
            where: { id: bookingId }
        });

        if (!booking) throw new NotFoundException('Không tìm thấy đơn hàng');

        return await this.prisma.bookings.update({
            where: { id: bookingId },
            data: { status },
            include: { customers: true, venues: true, courts: true }
        });
    }

    async getVenueStaffSchedule(userId: string, venueId?: string, page = 1, limit = 10, search?: string, status?: BookingStatus, date?: string) {
        let finalVenueId = venueId;

        // Nếu venueId là mock VN-1 hoặc rỗng, ta tìm cơ sở mà nhân viên này đang làm
        if (!finalVenueId || finalVenueId === 'VN-1') {
             const staffRecord = await this.prisma.venue_staff.findFirst({
                 where: { user_id: userId, is_active: true }
             });
             if (staffRecord) {
                 finalVenueId = staffRecord.venue_id;
             } else {
                 throw new BadRequestException('Bạn không được gán cho bất kỳ cơ sở nào trong hệ thống.');
             }
        }

        // 1. Verify that user is staff at this venue OR is a platform staff/admin
        const isVenueStaff = await this.prisma.venue_staff.findFirst({
            where: { venue_id: finalVenueId, user_id: userId, is_active: true }
        });

        if (!isVenueStaff) {
             const user = await this.prisma.users.findUnique({ where: { id: userId }, include: { role: true } });
             if (user?.role?.slug !== 'staff' && user?.role?.slug !== 'admin' && user?.role?.slug !== 'super_admin') {
                 throw new BadRequestException('Bạn không có quyền truy cập lịch trình của cơ sở này.');
             }
        }

        const skip = (page - 1) * limit;
        const where: any = { venue_id: finalVenueId };

        if (date) {
            where.booking_date = new Date(date);
        }

        if (status) {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { booking_code: { contains: search, mode: 'insensitive' } },
                { customers: { full_name: { contains: search, mode: 'insensitive' } } },
                { customers: { phone: { contains: search, mode: 'insensitive' } } },
                { courts: { name: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const [bookings, total] = await Promise.all([
            this.prisma.bookings.findMany({
                where,
                include: { customers: true, courts: true },
                orderBy: { start_time: 'asc' },
                skip,
                take: limit
            }),
            this.prisma.bookings.count({ where })
        ]);

        return {
            data: bookings.map(b => ({
                id: b.id,
                booking_code: b.booking_code,
                court_name: b.courts.name,
                customer_name: b.customers.full_name,
                customer_phone: b.customers.phone || 'N/A',
                booking_date: b.booking_date.toISOString().split('T')[0],
                start_time: b.start_time.toISOString().substring(11, 16),
                end_time: b.end_time.toISOString().substring(11, 16),
                total_amount: Number(b.total_amount),
                status: b.status,
                payment_status: b.payment_status,
                payment_method: b.payment_method
            })),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async venueStaffUpdateStatus(userId: string, bookingId: string, status: BookingStatus) {
        const booking = await this.prisma.bookings.findUnique({
            where: { id: bookingId },
            include: { venues: true }
        });

        if (!booking) throw new NotFoundException('Không tìm thấy đơn hàng');

        // Check permission: Is user staff of this venue?
        const isStaff = await this.prisma.venue_staff.findFirst({
            where: { venue_id: booking.venue_id, user_id: userId, is_active: true }
        });

        if (!isStaff) {
            const user = await this.prisma.users.findUnique({ where: { id: userId }, include: { role: true } });
            if (user?.role?.slug !== 'staff' && user?.role?.slug !== 'admin' && user?.role?.slug !== 'super_admin') {
                throw new BadRequestException('Bạn không có quyền cập nhật đơn hàng này');
            }
        }

        const updateData: any = { status };
        if (status === BookingStatus.CHECKED_IN) {
            updateData.checked_in_at = new Date();
            updateData.checked_in_by = userId;
        }

        return await this.prisma.bookings.update({
            where: { id: bookingId },
            data: updateData
        });
    }
}
