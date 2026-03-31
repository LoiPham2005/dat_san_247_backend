import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingStatus, VenueStatus, UserStatus } from '@prisma/client';
import { startOfDay, endOfDay, subDays } from 'date-fns';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) {}

    async getOwnerDashboardStats(ownerId: string) {
        const today = new Date();
        const startOfToday = startOfDay(today);
        const endOfToday = endOfDay(today);
        const startOfYesterday = startOfDay(subDays(today, 1));
        const endOfYesterday = endOfDay(subDays(today, 1));

        // 1. Venues count
        const venues = await this.prisma.venues.findMany({
            where: { owner_id: ownerId, deleted_at: null },
            select: { id: true, status: true }
        });
        const venuesCount = venues.length;
        const pendingVenuesCount = venues.filter(v => v.status === VenueStatus.PENDING).length;

        const venueIds = venues.map(v => v.id);

        // 2. Today's bookings
        const todayBookingsCount = await this.prisma.bookings.count({
            where: {
                venue_id: { in: venueIds },
                booking_date: {
                    gte: startOfToday,
                    lte: endOfToday
                },
                deleted_at: null
            }
        });

        // 3. Yesterday's bookings (for growth)
        const yesterdayBookingsCount = await this.prisma.bookings.count({
            where: {
                venue_id: { in: venueIds },
                booking_date: {
                    gte: startOfYesterday,
                    lte: endOfYesterday
                },
                deleted_at: null
            }
        });

        let bookingsGrowth = 0;
        if (yesterdayBookingsCount > 0) {
            bookingsGrowth = Math.round(((todayBookingsCount - yesterdayBookingsCount) / yesterdayBookingsCount) * 100);
        } else if (todayBookingsCount > 0) {
            bookingsGrowth = 100;
        }

        // 4. Today's Revenue (only PAID bookings)
        const todayRevenueResult = await this.prisma.bookings.aggregate({
            where: {
                venue_id: { in: venueIds },
                booking_date: {
                    gte: startOfToday,
                    lte: endOfToday
                },
                payment_status: 'PAID',
                deleted_at: null
            },
            _sum: {
                total_amount: true
            }
        });
        const todayRevenue = Number(todayRevenueResult._sum.total_amount || 0);

        // 5. Active Staff Count
        const activeStaffCount = await this.prisma.venue_staff.count({
            where: {
                venue_id: { in: venueIds },
                is_active: true
            }
        });

        // 6. Recent Bookings (top 5)
        const recentBookingsRaw = await this.prisma.bookings.findMany({
            where: {
                venue_id: { in: venueIds },
                deleted_at: null
            },
            orderBy: {
                created_at: 'desc'
            },
            take: 5,
            include: {
                courts: {
                    select: { name: true }
                },
                venues: {
                    select: { name: true }
                },
                customers: {
                    select: { full_name: true }
                }
            }
        });

        const recentBookings = recentBookingsRaw.map(b => ({
            id: b.id,
            bookingCode: b.booking_code,
            venueName: b.venues.name,
            courtName: b.courts.name,
            customerName: b.customers.full_name,
            totalAmount: Number(b.total_amount),
            status: b.status,
            paymentStatus: b.payment_status,
            createdAt: b.created_at
        }));

        return {
            venuesCount,
            pendingVenuesCount,
            todayBookingsCount,
            bookingsGrowth,
            todayRevenue,
            activeStaffCount,
            recentBookings
        };
    }

    async getStaffDashboardStats(userId: string, venueId: string = 'VN-1') {
        let finalVenueId = venueId;

        // Resolve VN-1 Mocking
        if (finalVenueId === 'VN-1') {
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
                    return null;
                }
            }
        }

        const today = new Date();
        const startOfToday = startOfDay(today);
        const endOfToday = endOfDay(today);
        const twoHoursLater = new Date(today.getTime() + 2 * 60 * 60 * 1000);

        // 1. Venue & Staff Info
        const venue = await this.prisma.venues.findUnique({
            where: { id: finalVenueId },
            select: { id: true, name: true, address: true, auto_accept_bookings: true }
        });

        const staff = await this.prisma.venue_staff.findFirst({
            where: { venue_id: finalVenueId, user_id: userId },
            include: { users: { select: { full_name: true } } }
        });

        if (!venue) return null;

        // 2. Booking Statistics (Today)
        const bookingsToday = await this.prisma.bookings.findMany({
            where: {
                venue_id: finalVenueId,
                booking_date: { gte: startOfToday, lte: endOfToday },
                deleted_at: null
            },
            select: { status: true, total_amount: true }
        });

        const stats = {
            totalBookingsToday: bookingsToday.length,
            pendingCount: bookingsToday.filter(b => b.status === BookingStatus.PENDING).length,
            confirmedCount: bookingsToday.filter(b => b.status === BookingStatus.CONFIRMED).length,
            checkedInCount: bookingsToday.filter(b => b.status === BookingStatus.CHECKED_IN).length,
            completedCount: bookingsToday.filter(b => b.status === BookingStatus.COMPLETED).length,
            noShowCount: bookingsToday.filter(b => b.status === BookingStatus.NO_SHOW).length,
            revenueToday: bookingsToday
                .filter(b => (([BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN, BookingStatus.COMPLETED] as string[]).includes(b.status)))
                .reduce((acc, b) => acc + Number(b.total_amount), 0),
            revenuePending: bookingsToday
                .filter(b => b.status === BookingStatus.PENDING)
                .reduce((acc, b) => acc + Number(b.total_amount), 0),
        };

        // 3. Waitlist Count
        const waitlistCount = await this.prisma.booking_waitlist.count({
            where: { courts: { venue_id: finalVenueId }, booking_date: { gte: startOfToday, lte: endOfToday } }
        });

        // 4. Maintenance Today
        const maintenanceToday = await this.prisma.court_maintenance.findMany({
            where: {
                courts: { venue_id: finalVenueId },
                OR: [
                    { start_at: { gte: startOfToday, lte: endOfToday } },
                    { end_at: { gte: startOfToday, lte: endOfToday } }
                ]
            },
            include: { creator: { select: { full_name: true } } }
        });

        // 5. Courts with current status
        const courts = await this.prisma.courts.findMany({
            where: { venue_id: finalVenueId, deleted_at: null },
            orderBy: { display_order: 'asc' },
            include: {
                bookings: {
                    where: {
                         booking_date: { gte: startOfToday, lte: endOfToday },
                         status: { in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] },
                         deleted_at: null
                    },
                    include: { customers: { select: { full_name: true, phone: true } } }
                },
                court_maintenance: {
                    where: {
                        start_at: { lte: today },
                        end_at: { gte: today }
                    }
                }
            }
        });

        const courtSnapshots = courts.map(c => {
            const currentBooking = c.bookings.find(b => 
                new Date(`1970-01-01T${b.start_time.toISOString().split('T')[1]}`) <= new Date(`1970-01-01T${today.toISOString().split('T')[1]}`) &&
                new Date(`1970-01-01T${b.end_time.toISOString().split('T')[1]}`) >= new Date(`1970-01-01T${today.toISOString().split('T')[1]}`)
            );
            
            const nextBooking = c.bookings
                .filter(b => new Date(`1970-01-01T${b.start_time.toISOString().split('T')[1]}`) > new Date(`1970-01-01T${today.toISOString().split('T')[1]}`))
                .sort((a, b) => a.start_time.getTime() - b.start_time.getTime())[0];

            return {
                id: c.id,
                name: c.name,
                isIndoor: c.is_indoor,
                isActive: c.is_active,
                surfaceType: c.surface_type,
                size: c.size,
                pricePerHour: Number(c.price_per_hour),
                displayOrder: c.display_order,
                currentBooking: currentBooking ? {
                    id: currentBooking.id,
                    bookingCode: currentBooking.booking_code,
                    customerName: currentBooking.customers.full_name,
                    customerPhone: currentBooking.customers.phone,
                    startTime: currentBooking.start_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    endTime: currentBooking.end_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                } : null,
                nextBooking: nextBooking ? {
                    customerName: nextBooking.customers.full_name,
                    startTime: nextBooking.start_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                } : null,
                activeMaintenance: c.court_maintenance[0] ? {
                    id: c.court_maintenance[0].id,
                    reason: c.court_maintenance[0].reason,
                    startAt: c.court_maintenance[0].start_at,
                    endAt: c.court_maintenance[0].end_at,
                } : null,
                todayBookingCount: c.bookings.length,
                todayCheckedInCount: c.bookings.filter(b => b.status === BookingStatus.CHECKED_IN).length,
            };
        });

        // 6. Recent Pending (top 3 for shortcut)
        const recentPending = await this.prisma.bookings.findMany({
            where: {
                venue_id: finalVenueId,
                status: BookingStatus.PENDING,
                deleted_at: null
            },
            take: 3,
            orderBy: { created_at: 'desc' },
            include: {
                courts: { select: { name: true } },
                customers: { select: { full_name: true, phone: true } }
            }
        });

        return {
            venueId: venue.id,
            venueName: venue.name,
            venueAddress: venue.address,
            date: today,
            staffName: staff?.users?.full_name || 'Nhân viên',
            staffRole: staff?.role || 'STAFF',
            shiftStart: staff?.work_start_time?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            shiftEnd: staff?.work_end_time?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            autoAccept: venue.auto_accept_bookings,
            ...stats,
            waitlistCount,
            courts: courtSnapshots,
            maintenanceToday: maintenanceToday.map(m => ({
                id: m.id,
                courtId: m.court_id,
                startAt: m.start_at,
                endAt: m.end_at,
                reason: m.reason,
                isEmergency: m.is_emergency,
                creatorName: m.creator?.full_name
            })),
            recentPending: recentPending.map(b => ({
                id: b.id,
                time: `${b.start_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${b.end_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                courtName: b.courts.name,
                customerName: b.customers.full_name,
                customerPhone: b.customers.phone
            }))
        };
    }
}
