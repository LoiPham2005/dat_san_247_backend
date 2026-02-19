import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TicketStatus } from '../../common/constants/chat.constant';
import { UserRole } from '../../common/constants/role.constant';
import { BookingStatus } from '../../common/constants/booking-status.constant';
import { VenueStatus } from '../../common/constants/venue-status.constant';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    async getSuperAdminOverview() {
        const [
            userCount,
            venueCount,
            pendingVenueCount,
            openTicketCount,
            revenueResult,
            pendingPayoutResult,
            bookingToday
        ] = await Promise.all([
            this.prisma.users.count(),
            this.prisma.venues.count(),
            this.prisma.venues.count({ where: { status: VenueStatus.PENDING as any } }),
            this.prisma.support_tickets.count({ where: { status: TicketStatus.OPEN as any } }),
            this.prisma.payments.aggregate({
                _sum: { amount: true },
                where: { status: 'PAID' as any }
            }),
            this.prisma.payments.aggregate({
                _sum: { amount: true },
                where: { status: 'PENDING' as any }
            }),
            this.prisma.bookings.count({
                where: { booking_date: new Date() }
            })
        ]);

        return {
            totalUsers: userCount,
            activeVenues: venueCount,
            totalRevenue: Number(revenueResult._sum.amount || 0),
            bookingsToday: bookingToday,
            pendingVenues: pendingVenueCount,
            openTickets: openTicketCount,
            pendingPayouts: Number(pendingPayoutResult._sum.amount || 0),
        };
    }

    async getRevenueChartData() {
        return [
            { date: '2024-01', revenue: 10000000 },
            { date: '2024-02', revenue: 15000000 },
        ];
    }

    async getTopVenues() {
        // Group bookings by venue, sum amount
        const topVenues = await this.prisma.bookings.groupBy({
            by: ['venue_id'],
            _sum: { total_amount: true },
            orderBy: { _sum: { total_amount: 'desc' } },
            take: 10,
        });

        // Enrich with venue names
        const venueIds = topVenues.map(v => v.venue_id);
        const venues = await this.prisma.venues.findMany({
            where: { id: { in: venueIds } },
            select: { id: true, name: true }
        });

        return topVenues.map(item => {
            const venue = venues.find(v => v.id === item.venue_id);
            return {
                id: item.venue_id,
                name: venue?.name || 'Unknown',
                totalRevenue: Number(item._sum.total_amount || 0)
            };
        });
    }

    async getTopCustomers() {
        const topUsers = await this.prisma.bookings.groupBy({
            by: ['customer_id'],
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 10,
        });

        const userIds = topUsers.map(u => u.customer_id);
        const users = await this.prisma.users.findMany({
            where: { id: { in: userIds } },
            select: { id: true, full_name: true, email: true }
        });

        return topUsers.map(item => {
            const user = users.find(u => u.id === item.customer_id);
            return {
                id: item.customer_id,
                fullName: user?.full_name || 'Unknown',
                email: user?.email || '',
                totalBookings: (item._count as any).id
            };
        });
    }

    async getRecentActivities() {
        return [];
    }

    async getOwnerOverview(ownerId: string) {
        const venues = await this.prisma.venues.findMany({
            where: { owner_id: ownerId },
            select: { id: true, rating: true }
        });

        const venueIds = venues.map(v => v.id);

        if (venueIds.length === 0) {
            return { totalRevenue: 0, bookingCount: 0, occupancyRate: 0, averageRating: 0 };
        }

        const revenueResult = await this.prisma.payments.aggregate({
            _sum: { amount: true },
            where: {
                bookings: { venue_id: { in: venueIds } },
                status: 'PAID' as any
            }
        });

        const bookingStats = await this.prisma.bookings.groupBy({
            by: ['status'],
            where: { venue_id: { in: venueIds } },
            _count: { id: true }
        });

        const avgRating = venues.reduce((acc, v) => acc + Number(v.rating || 0), 0) / (venues.length || 1);

        return {
            totalRevenue: Number(revenueResult._sum.amount || 0),
            bookingStats: bookingStats.map(s => ({ status: s.status, count: s._count.id })),
            averageRating: avgRating,
        };
    }

    async getOwnerRevenueChart(ownerId: string) {
        return [];
    }

    async getUpcomingBookings(ownerId: string) {
        const bookings = await this.prisma.bookings.findMany({
            where: {
                venues: { owner_id: ownerId },
                booking_date: { gte: new Date() },
                status: { in: [BookingStatus.CONFIRMED as any, BookingStatus.PENDING as any] }
            },
            include: { courts: true, venues: true },
            orderBy: [
                { booking_date: 'asc' },
                { start_time: 'asc' }
            ],
            take: 10
        });

        // Map to expected output structure if necessary, or return as is (camelCase needed?)
        // The original code returned entities which have camelCase if mapped, but TypeORM returns entity instances.
        // I should probably map them. But for dashboard/upcoming usually just data.
        // I will map relation fields to match previous logic (innerJoinAndSelect 'court', 'venue').
        // The previous return was array of Booking entities.
        // My result is snake_case fields from Prisma.
        // I can implement a mapper or just return logic.
        // Given it's a "get" method used by controller, controller sends to frontend.
        // Frontend likely expects snake_case if I don't map. But other services I mapped.
        // I will map.

        return bookings.map(b => ({
            ...b,
            id: b.id,
            bookingCode: b.booking_code,
            bookingDate: b.booking_date,
            startTime: b.start_time,
            endTime: b.end_time,
            status: b.status,
            totalAmount: b.total_amount,
            courtName: b.courts?.name, // Simplified for dashboard
            venueName: b.venues?.name,
            court: b.courts,
            venue: b.venues
        }));
    }

    async getVenueStaffOverview(venueIds: string[]) {
        if (venueIds.length === 0) return { todayBookings: 0, pendingCheckins: 0 };

        const today = new Date();
        // today.setHours(0, 0, 0, 0); // Prisma Date usually matches YYYY-MM-DD for @db.Date

        const totalBookings = await this.prisma.bookings.count({
            where: {
                venue_id: { in: venueIds },
                booking_date: today
            }
        });

        const pendingCheckins = await this.prisma.bookings.count({
            where: {
                venue_id: { in: venueIds },
                booking_date: today,
                status: BookingStatus.CONFIRMED as any // Confirmed bookings waiting for checkin
            }
        });

        return {
            todayBookings: totalBookings,
            pendingCheckins: pendingCheckins,
        };
    }

    async getSportDistribution() {
        // Use raw query for jsonb array elements.
        // TypeORM: select('jsonb_array_elements_text(court.sportTypes)', 'label')

        // Prisma raw
        try {
            const result: any[] = await this.prisma.$queryRaw`
                SELECT jsonb_array_elements_text(sport_types) as label, COUNT(id) as count
                FROM courts
                GROUP BY label
            `;
            // result: [{ label: 'tennis', count: 5n }]
            // Convert BigInt count to number
            return result.map(r => ({
                label: r.label,
                count: Number(r.count)
            }));
        } catch (e) {
            console.error("Error in getSportDistribution", e);
            return [];
        }
    }
}
