import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class VenuesAdminService {
    constructor(private prisma: PrismaService) { }

    async getVenues() {
        // Find venues with their owner's info and verification status
        const venues = await this.prisma.venues.findMany({
            include: {
                users: {
                    select: {
                        full_name: true,
                        email: true,
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        // Map to match AdminVenue interface
        return venues.map(v => ({
            id: v.id,
            name: v.name,
            city: v.city,
            district: v.district,
            owner_name: v.users?.full_name || 'N/A',
            owner_email: v.users?.email || 'N/A',
            status: v.status,
            is_featured: v.is_featured,
            featured_until: v.featured_until,
            commission_rate: Number(v.commission_rate),
            rating: Number(v.rating),
            total_reviews: v.total_reviews,
            created_at: v.created_at,
            admin_notes: v.admin_notes
        }));
    }

    async getVenueDetail(id: string) {
        const venue = await this.prisma.venues.findUnique({
            where: { id },
            include: {
                users: {
                    select: {
                        full_name: true,
                        email: true,
                        phone: true
                    }
                },
                venue_verifications: {
                    orderBy: { created_at: 'desc' },
                    take: 1
                }
            }
        });

        if (!venue) throw new NotFoundException('Venue not found');

        return venue;
    }

    async updateStatus(id: string, status: any) {
        const venue = await this.prisma.venues.findUnique({ where: { id } });
        if (!venue) throw new NotFoundException('Venue not found');

        return this.prisma.venues.update({
            where: { id },
            data: { status }
        });
    }

    async updateFeatured(id: string, is_featured: boolean) {
        const venue = await this.prisma.venues.findUnique({ where: { id } });
        if (!venue) throw new NotFoundException('Venue not found');

        return this.prisma.venues.update({
            where: { id },
            data: {
                is_featured,
                featured_until: is_featured ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null
            }
        });
    }

    async updateCommissionRate(id: string, commission_rate: number) {
        const venue = await this.prisma.venues.findUnique({ where: { id } });
        if (!venue) throw new NotFoundException('Venue not found');

        return this.prisma.venues.update({
            where: { id },
            data: {
                commission_rate
            }
        });
    }

    async updateAdminNotes(id: string, admin_notes: string) {
        const venue = await this.prisma.venues.findUnique({ where: { id } });
        if (!venue) throw new NotFoundException('Venue not found');

        return this.prisma.venues.update({
            where: { id },
            data: {
                admin_notes
            }
        });
    }
}
