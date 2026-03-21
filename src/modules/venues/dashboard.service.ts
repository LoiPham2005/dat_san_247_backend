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
}
