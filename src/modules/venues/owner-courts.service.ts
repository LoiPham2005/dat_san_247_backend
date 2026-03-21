import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OwnerCourtService {
    constructor(private prisma: PrismaService) { }

    // Helper to check ownership
    private async checkVenueOwnership(venueId: string, ownerId: string) {
        const venue = await this.prisma.venues.findUnique({
            where: { id: venueId, owner_id: ownerId }
        });
        if (!venue) throw new ForbiddenException("Bạn không có quyền hoặc venue không tồn tại");
        return venue;
    }

    private async checkCourtOwnership(courtId: string, ownerId: string) {
        const court = await this.prisma.courts.findUnique({
            where: { id: courtId },
            include: { venues: true }
        });
        if (!court || court.venues.owner_id !== ownerId) {
            throw new ForbiddenException("Bạn không có quyền hoặc court không tồn tại");
        }
        return court;
    }

    // COURTS
    async getCourtsByVenue(venueId: string, ownerId: string) {
        await this.checkVenueOwnership(venueId, ownerId);
        const courts = await this.prisma.courts.findMany({
            where: { venue_id: venueId, deleted_at: null },
            orderBy: { display_order: 'asc' }
        });

        return courts.map(c => ({
            ...c,
            price_per_hour: Number(c.price_per_hour)
        }));
    }

    async createCourt(venueId: string, ownerId: string, data: any) {
        await this.checkVenueOwnership(venueId, ownerId);
        
        const count = await this.prisma.courts.count({ where: { venue_id: venueId, deleted_at: null } });

        const court = await this.prisma.courts.create({
            data: {
                venue_id: venueId,
                name: data.name,
                description: data.description,
                price_per_hour: data.price_per_hour,
                surface_type: data.surface_type,
                size: data.size,
                is_indoor: data.is_indoor || false,
                is_active: data.is_active !== undefined ? data.is_active : true,
                display_order: data.display_order || count + 1
            }
        });
        return { ...court, price_per_hour: Number(court.price_per_hour) };
    }

    async updateCourt(courtId: string, ownerId: string, data: any) {
        await this.checkCourtOwnership(courtId, ownerId);
        const court = await this.prisma.courts.update({
            where: { id: courtId },
            data: {
                name: data.name,
                description: data.description,
                price_per_hour: data.price_per_hour,
                surface_type: data.surface_type,
                size: data.size,
                is_indoor: data.is_indoor,
                is_active: data.is_active,
                display_order: data.display_order
            }
        });
        return { ...court, price_per_hour: Number(court.price_per_hour) };
    }

    async deleteCourt(courtId: string, ownerId: string) {
        await this.checkCourtOwnership(courtId, ownerId);
        return this.prisma.courts.update({
            where: { id: courtId },
            data: { deleted_at: new Date() }
        });
    }

    // PRICING RULES
    async getPricingRules(courtId: string, ownerId: string) {
        await this.checkCourtOwnership(courtId, ownerId);
        const rules = await this.prisma.pricing_rules.findMany({
            where: { court_id: courtId, is_active: true },
            orderBy: { start_time: 'asc' }
        });
        return rules.map(r => ({
            ...r,
            price: Number(r.price),
            start_time: r.start_time.toISOString().substring(11, 16),
            end_time: r.end_time.toISOString().substring(11, 16)
        }));
    }

    async createPricingRule(courtId: string, ownerId: string, data: any) {
        await this.checkCourtOwnership(courtId, ownerId);
        
        if (data.price === undefined || data.price === null) {
            throw new BadRequestException("Giá (price) là bắt buộc và hợp lệ.");
        }

        let start_time_str = data.start_time.split(':').slice(0, 2).join(':') + ':00';
        let end_time_str = data.end_time.split(':').slice(0, 2).join(':') + ':00';
        let start_time = new Date(`1970-01-01T${start_time_str}Z`);
        let end_time = new Date(`1970-01-01T${end_time_str}Z`);

        const rule = await this.prisma.pricing_rules.create({
            data: {
                court_id: courtId,
                name: data.name,
                day_of_week: data.day_of_week || null,
                start_time: start_time,
                end_time: end_time,
                price: data.price,
                start_date: data.start_date ? new Date(data.start_date) : null,
                end_date: data.end_date ? new Date(data.end_date) : null,
                priority: data.priority || 1,
            }
        });
        return {
            ...rule,
            price: Number(rule.price),
            start_time: rule.start_time.toISOString().substring(11, 16),
            end_time: rule.end_time.toISOString().substring(11, 16)
        };
    }

    async deletePricingRule(id: string, courtId: string, ownerId: string) {
        await this.checkCourtOwnership(courtId, ownerId);
        return this.prisma.pricing_rules.delete({ where: { id } });
    }

    // MAINTENANCE
    async getMaintenances(courtId: string, ownerId: string) {
        await this.checkCourtOwnership(courtId, ownerId);
        return this.prisma.court_maintenance.findMany({
            where: { court_id: courtId }
        });
    }

    async createMaintenance(courtId: string, ownerId: string, data: any) {
        await this.checkCourtOwnership(courtId, ownerId);

        if (!data.start_at || !data.end_at) {
            throw new BadRequestException("Vui lòng cung cấp start_at và end_at hợp lệ.");
        }

        return this.prisma.court_maintenance.create({
            data: {
                court_id: courtId,
                start_at: new Date(data.start_at),
                end_at: new Date(data.end_at),
                reason: data.reason,
                is_emergency: data.is_emergency || false,
                created_by: ownerId
            }
        });
    }

    async deleteMaintenance(id: string, courtId: string, ownerId: string) {
        await this.checkCourtOwnership(courtId, ownerId);
        return this.prisma.court_maintenance.delete({ where: { id } });
    }

    // AMENITIES
    async getAmenities(courtId: string, ownerId: string) {
        await this.checkCourtOwnership(courtId, ownerId);
        return this.prisma.amenities.findMany({
            where: { court_id: courtId }
        });
    }

    async createAmenity(courtId: string, ownerId: string, data: any) {
        await this.checkCourtOwnership(courtId, ownerId);
        return this.prisma.amenities.create({
            data: {
                court_id: courtId,
                name: data.name,
                icon: data.icon,
                is_free: data.is_free !== undefined ? data.is_free : true
            }
        });
    }

    async deleteAmenity(id: string, courtId: string, ownerId: string) {
        await this.checkCourtOwnership(courtId, ownerId);
        return this.prisma.amenities.delete({ where: { id } });
    }

    // SPORTS
    async getSports(courtId: string, ownerId: string) {
        await this.checkCourtOwnership(courtId, ownerId);
        return this.prisma.sport_assignments.findMany({
            where: { court_id: courtId }
        });
    }

    async createSport(courtId: string, ownerId: string, data: any) {
        await this.checkCourtOwnership(courtId, ownerId);
        
        // Prevent duplicate sport for the same court
        const existing = await this.prisma.sport_assignments.findUnique({
            where: {
                court_id_sport_type: {
                    court_id: courtId,
                    sport_type: data.sport_type
                }
            }
        });

        if (existing) {
            throw new BadRequestException("Sân này đã gắn môn thể thao này rồi");
        }

        return this.prisma.sport_assignments.create({
            data: {
                court_id: courtId,
                sport_type: data.sport_type
            }
        });
    }

    async deleteSport(id: string, courtId: string, ownerId: string) {
        await this.checkCourtOwnership(courtId, ownerId);
        return this.prisma.sport_assignments.delete({ where: { id } });
    }
}
