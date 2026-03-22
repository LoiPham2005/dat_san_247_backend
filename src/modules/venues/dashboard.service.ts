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
                // If not staff, check if they are owner
                const ownedVenue = await this.prisma.venues.findFirst({
                    where: { owner_id: userId, deleted_at: null }
                });
                if (ownedVenue) {
                    finalVenueId = ownedVenue.id;
                } else {
                    return null; // No venue assigned
                }
            }
        }

        const today = new Date();
        const startOfToday = startOfDay(today);
        const endOfToday = endOfDay(today);

        // 1. Get Venue Info
        const venue = await this.prisma.venues.findUnique({
            where: { id: finalVenueId },
            select: { id: true, name: true, auto_accept_bookings: true }
        });

        if (!venue) return null;

        // 2. Statistics
        // Today's Revenue (Calculated based on CONFIRMED/CHECKED_IN/COMPLETED bookings today)
        const revenueResult = await this.prisma.bookings.aggregate({
            where: {
                venue_id: finalVenueId,
                booking_date: { gte: startOfToday, lte: endOfToday },
                status: { in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN, BookingStatus.COMPLETED] },
                deleted_at: null
            },
            _sum: { total_amount: true }
        });

        // Pending Bookings
        const pendingCount = await this.prisma.bookings.count({
            where: {
                venue_id: finalVenueId,
                status: BookingStatus.PENDING,
                deleted_at: null
            }
        });

        // Checked-in / Active Bookings
        const checkedInCount = await this.prisma.bookings.count({
            where: {
                venue_id: finalVenueId,
                status: BookingStatus.CHECKED_IN,
                deleted_at: null
            }
        });

        // Waitlist Count
        const waitlistCount = await this.prisma.booking_waitlist.count({
            where: { courts: { venue_id: finalVenueId } }
        });

        // Recent Pending Bookings (top 3 for shortcut)
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
            venueName: venue.name,
            autoAccept: venue.auto_accept_bookings,
            todayRevenue: Number(revenueResult._sum.total_amount || 0),
            pendingCount,
            checkedInCount,
            waitlistCount,
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
