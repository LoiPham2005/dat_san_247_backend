import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CourtsService {
    constructor(private prisma: PrismaService) { }

    private mapCourt(court: any) {
        if (!court) return null;
        return {
            ...court,
            id: court.id,
            venueId: court.venue_id,
            name: court.name,
            sportTypes: (court as any).sport_assignments?.map(sa => sa.sport_type) || [],
            amenities: (court as any).amenities?.map(a => a.name) || [],
        };
    }

    private mapPricingRule(rule: any) {
        return {
            ...rule,
            startTime: rule.start_time,
            endTime: rule.end_time,
            price: Number(rule.price),
            dayOfWeek: rule.day_of_week,
        };
    }

    async findAllByVenue(venueId: string) {
        const courts = await this.prisma.courts.findMany({
            where: { venue_id: venueId },
            include: {
                sport_assignments: true,
                amenities: true,
            } as any
        });
        return courts.map(c => this.mapCourt(c));
    }

    async findOne(id: string) {
        const court = await this.prisma.courts.findUnique({
            where: { id },
            include: {
                venues: true,
                sport_assignments: true,
                amenities: true,
            } as any
        });
        if (!court) throw new NotFoundException('Court not found');

        // Manual images fetch
        const images = await this.prisma.media_attachments.findMany({
            where: { entity_type: 'COURT', entity_id: id },
            include: { files: true },
            orderBy: { display_order: 'asc' }
        });

        return { ...this.mapCourt(court), images };
    }

    async create(ownerId: string, data: any) {
        const venue = await this.prisma.venues.findFirst({
            where: { id: data.venueId, owner_id: ownerId }
        });
        if (!venue) throw new ForbiddenException('You do not own this venue');

        const court = await this.prisma.courts.create({
            data: {
                venue_id: data.venueId,
                name: data.name,
                description: data.description,
                price_per_hour: data.pricePerHour || 0,
                surface_type: data.type,
            } as any
        });
        return this.mapCourt(court);
    }

    async update(ownerId: string, id: string, data: any) {
        const court = await this.prisma.courts.findUnique({
            where: { id },
            include: { venues: true } as any
        });
        if (!court) throw new NotFoundException('Court not found');
        if ((court as any).venues.owner_id !== ownerId) throw new ForbiddenException();

        const updated = await this.prisma.courts.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                price_per_hour: data.pricePerHour,
                surface_type: data.type,
            } as any
        });
        return this.mapCourt(updated);
    }

    async softDelete(ownerId: string, id: string) {
        const court = await this.prisma.courts.findUnique({
            where: { id },
            include: { venues: true } as any
        });
        if (!court) throw new NotFoundException('Court not found');
        if ((court as any).venues.owner_id !== ownerId) throw new ForbiddenException();

        await this.prisma.courts.update({
            where: { id },
            data: { deleted_at: new Date() }
        });
        return { success: true };
    }

    async getPricingRules(courtId: string) {
        const rules = await this.prisma.pricing_rules.findMany({
            where: { court_id: courtId, is_active: true }
        });
        return rules.map(r => this.mapPricingRule(r));
    }

    async updatePricingRules(ownerId: string, courtId: string, rules: any[]) {
        const court = await this.prisma.courts.findUnique({
            where: { id: courtId },
            include: { venues: true } as any
        });
        if (!court) throw new NotFoundException('Court not found');
        if ((court as any).venues.owner_id !== ownerId) throw new ForbiddenException();

        await this.prisma.$transaction(async (tx) => {
            await tx.pricing_rules.deleteMany({ where: { court_id: courtId } });
            if (rules.length > 0) {
                await tx.pricing_rules.createMany({
                    data: rules.map(rule => ({
                        court_id: courtId,
                        day_of_week: rule.dayOfWeek,
                        start_time: new Date(`1970-01-01T${rule.startTime}`),
                        end_time: new Date(`1970-01-01T${rule.endTime}`),
                        price: rule.price,
                    }))
                });
            }
        });
        return { success: true };
    }
}
