import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LookupService {
    constructor(private prisma: PrismaService) {}

    async searchUsers(search?: string, page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;
        const where = {
            OR: search ? [
                { full_name: { contains: search, mode: 'insensitive' as any } },
                { email: { contains: search, mode: 'insensitive' as any } },
                { phone: { contains: search, mode: 'insensitive' as any } }
            ] : undefined
        };

        const [items, total] = await Promise.all([
            this.prisma.users.findMany({
                where,
                select: {
                    id: true,
                    full_name: true,
                    email: true,
                    phone: true,
                    role: {
                        select: { name: true }
                    },
                    status: true,
                    created_at: true
                },
                skip,
                take: limit,
                orderBy: { created_at: 'desc' }
            }),
            this.prisma.users.count({ where })
        ]);

        return { items, total };
    }

    async searchVenues(search?: string, page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;
        const where = {
            OR: search ? [
                { name: { contains: search, mode: 'insensitive' as any } },
                { address: { contains: search, mode: 'insensitive' as any } },
                { phone: { contains: search, mode: 'insensitive' as any } }
            ] : undefined,
            deleted_at: null
        };

        const [items, total] = await Promise.all([
            this.prisma.venues.findMany({
                where,
                include: {
                    _count: {
                        select: { courts: true }
                    }
                },
                skip,
                take: limit,
                orderBy: { created_at: 'desc' }
            }),
            this.prisma.venues.count({ where })
        ]);

        return { items, total };
    }

    async searchBookings(search?: string, page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;
        const where = {
            OR: search ? [
                { booking_code: { contains: search, mode: 'insensitive' as any } },
                { customers: { full_name: { contains: search, mode: 'insensitive' as any } } },
                { customers: { phone: { contains: search, mode: 'insensitive' as any } } }
            ] : undefined,
            deleted_at: null
        };

        const [items, total] = await Promise.all([
            this.prisma.bookings.findMany({
                where,
                include: {
                    customers: {
                        select: {
                            full_name: true,
                            phone: true
                        }
                    },
                    venues: {
                        select: {
                            name: true
                        }
                    }
                },
                skip,
                take: limit,
                orderBy: { created_at: 'desc' }
            }),
            this.prisma.bookings.count({ where })
        ]);

        return { items, total };
    }

    async getSportTypes() {
        return this.prisma.sport_types.findMany({
            where: { is_active: true },
            orderBy: { name: 'asc' }
        });
    }
}
