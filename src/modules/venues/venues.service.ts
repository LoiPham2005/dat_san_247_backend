import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { slugify } from '../../common/utils/slug.util';

@Injectable()
export class VenuesService {
    constructor(private prisma: PrismaService) { }

    async getMyVenues(ownerId: string) {
        return this.prisma.venues.findMany({
            where: { owner_id: ownerId, deleted_at: null },
            orderBy: { created_at: 'desc' },
        });
    }

    async createVenue(ownerId: string, dto: CreateVenueDto) {
        const slug = await this.generateUniqueSlug(dto.name);
        return this.prisma.venues.create({
            data: {
                ...dto,
                city: dto.city || 'Hà Nội',
                district: dto.district || 'Hà Nội',
                owner_id: ownerId,
                slug: slug,
                status: 'PENDING',
            },
        });
    }

    async updateVenue(id: string, ownerId: string, dto: UpdateVenueDto) {
        const venue = await this.prisma.venues.findFirst({
            where: { id, owner_id: ownerId, deleted_at: null },
        });

        if (!venue) {
            throw new NotFoundException('Venue not found or you are not the owner');
        }

        const updateData: any = { ...dto };
        if (dto.name && dto.name !== venue.name) {
            updateData.slug = await this.generateUniqueSlug(dto.name);
        }

        return this.prisma.venues.update({
            where: { id },
            data: updateData,
        });
    }

    async deleteVenue(id: string, ownerId: string) {
        const venue = await this.prisma.venues.findFirst({
            where: { id, owner_id: ownerId, deleted_at: null },
        });

        if (!venue) {
            throw new NotFoundException('Venue not found or you are not the owner');
        }

        return this.prisma.venues.update({
            where: { id },
            data: { deleted_at: new Date() },
        });
    }

    async getVerification(venueId: string, ownerId: string) {
        const venue = await this.prisma.venues.findFirst({
            where: { id: venueId, owner_id: ownerId, deleted_at: null },
        });

        if (!venue) throw new NotFoundException('Venue not found');

        return this.prisma.venue_verifications.findFirst({
            where: { venue_id: venueId },
            orderBy: { created_at: 'desc' }
        });
    }

    async submitVerification(venueId: string, ownerId: string, dto: any) {
        const venue = await this.prisma.venues.findFirst({
            where: { id: venueId, owner_id: ownerId, deleted_at: null },
        });

        if (!venue) throw new NotFoundException('Venue not found');

        return this.prisma.venue_verifications.create({
            data: {
                ...dto,
                venue_id: venueId,
                status: 'PENDING'
            }
        });
    }

    async getOperatingHours(venueId: string, ownerId: string) {
        const venue = await this.prisma.venues.findFirst({
            where: { id: venueId, owner_id: ownerId, deleted_at: null },
        });

        if (!venue) throw new NotFoundException('Venue not found');

        return this.prisma.venue_operating_hours.findMany({
            where: { venue_id: venueId },
            orderBy: { day_of_week: 'asc' }
        });
    }

    async updateOperatingHours(venueId: string, ownerId: string, hours: any[]) {
        const venue = await this.prisma.venues.findFirst({
            where: { id: venueId, owner_id: ownerId, deleted_at: null },
        });

        if (!venue) throw new NotFoundException('Venue not found');

        // Hàm helper để tạo Date object với giờ, phút, giây cụ thể
        const toDateWithTime = (timeStr: string) => {
            if (!timeStr) return new Date();
            const [hours, minutes, seconds] = timeStr.split(':');
            const d = new Date(1970, 0, 1, parseInt(hours), parseInt(minutes) || 0, parseInt(seconds) || 0);
            return d;
        };

        return this.prisma.$transaction(
            hours.map((h) =>
                this.prisma.venue_operating_hours.upsert({
                    where: {
                        venue_id_day_of_week: {
                            venue_id: venueId,
                            day_of_week: h.day_of_week,
                        },
                    },
                    update: {
                        opening_time: toDateWithTime(h.opening_time),
                        closing_time: toDateWithTime(h.closing_time),
                        is_closed: h.is_closed,
                    },
                    create: {
                        venue_id: venueId,
                        day_of_week: h.day_of_week,
                        opening_time: toDateWithTime(h.opening_time),
                        closing_time: toDateWithTime(h.closing_time),
                        is_closed: h.is_closed,
                    },
                }),
            ),
        );
    }

    private async generateUniqueSlug(name: string): Promise<string> {
        let slug = slugify(name);
        let count = 0;
        let finalSlug = slug;

        while (true) {
            const existing = await this.prisma.venues.findUnique({ where: { slug: finalSlug } });
            if (!existing) break;
            count++;
            finalSlug = `${slug}-${count}`;
        }
        return finalSlug;
    }
}
