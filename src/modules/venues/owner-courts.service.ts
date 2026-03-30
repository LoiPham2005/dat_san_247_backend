import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OwnerCourtService {
    constructor(private prisma: PrismaService) { }

    // Helper to check ownership or staff access
    private async checkVenueAccess(venueId: string, userId: string) {
        let finalVenueId = venueId;
        
        const isUuid = /^[0-9a-fA-F-]{36}$/.test(venueId);
        if (!isUuid || finalVenueId === 'VN-1') {
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
                    throw new BadRequestException('Bạn không được gán cho bất kỳ cơ sở nào trong hệ thống.');
                }
            }
        }

        const venue = await this.prisma.venues.findUnique({
            where: { id: finalVenueId }
        });

        if (!venue) throw new NotFoundException("Cơ sở không tồn tại");

        // If owner or admin
        if (venue.owner_id === userId) return venue;

        // Check if staff
        const isStaff = await this.prisma.venue_staff.findFirst({
            where: { venue_id: finalVenueId, user_id: userId, is_active: true }
        });

        if (!isStaff) {
             const user = await this.prisma.users.findUnique({ where: { id: userId }, include: { role: true } });
             if (user?.role?.slug !== 'admin' && user?.role?.slug !== 'super_admin' && user?.role?.slug !== 'staff') {
                 throw new ForbiddenException("Bạn không có quyền truy cập cơ sở này");
             }
        }
        
        return venue;
    }

    private async checkCourtAccess(courtId: string, userId: string) {
        const court = await this.prisma.courts.findUnique({
            where: { id: courtId },
            include: { venues: true }
        });

        if (!court) throw new NotFoundException("Sân không tồn tại");

        await this.checkVenueAccess(court.venue_id, userId);
        
        return court;
    }

    // COURTS
    async getCourtsByVenue(venueId: string, userId: string) {
        const venue = await this.checkVenueAccess(venueId, userId);
        const courts = await this.prisma.courts.findMany({
            where: { venue_id: venue.id, deleted_at: null },
            orderBy: { display_order: 'asc' }
        });

        return courts.map(c => ({
            ...c,
            price_per_hour: Number(c.price_per_hour)
        }));
    }

    async createCourt(venueId: string, userId: string, data: any) {
        const venue = await this.checkVenueAccess(venueId, userId);
        
        const count = await this.prisma.courts.count({ where: { venue_id: venue.id, deleted_at: null } });

        const court = await this.prisma.courts.create({
            data: {
                venue_id: venue.id,
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

    async updateCourt(courtId: string, userId: string, data: any) {
        await this.checkCourtAccess(courtId, userId);
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

    async deleteCourt(courtId: string, userId: string) {
        await this.checkCourtAccess(courtId, userId);
        return this.prisma.courts.update({
            where: { id: courtId },
            data: { deleted_at: new Date() }
        });
    }

    // PRICING RULES
    async getPricingRules(courtId: string, userId: string) {
        await this.checkCourtAccess(courtId, userId);
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

    async createPricingRule(courtId: string, userId: string, data: any) {
        await this.checkCourtAccess(courtId, userId);
        
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

    async deletePricingRule(id: string, courtId: string, userId: string) {
        await this.checkCourtAccess(courtId, userId);
        return this.prisma.pricing_rules.delete({ where: { id } });
    }

    // MAINTENANCE
    async getMaintenances(courtId: string, userId: string) {
        await this.checkCourtAccess(courtId, userId);
        return this.prisma.court_maintenance.findMany({
            where: { court_id: courtId }
        });
    }

    async createMaintenance(courtId: string, userId: string, data: any) {
        await this.checkCourtAccess(courtId, userId);

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
                created_by: userId
            }
        });
    }

    async deleteMaintenance(id: string, courtId: string, userId: string) {
        await this.checkCourtAccess(courtId, userId);
        return this.prisma.court_maintenance.delete({ where: { id } });
    }

    // AMENITIES
    async getAmenities(courtId: string, userId: string) {
        await this.checkCourtAccess(courtId, userId);
        return this.prisma.amenities.findMany({
            where: { court_id: courtId }
        });
    }

    async createAmenity(courtId: string, userId: string, data: any) {
        await this.checkCourtAccess(courtId, userId);
        return this.prisma.amenities.create({
            data: {
                court_id: courtId,
                name: data.name,
                icon: data.icon,
                is_free: data.is_free !== undefined ? data.is_free : true
            }
        });
    }

    async deleteAmenity(id: string, courtId: string, userId: string) {
        await this.checkCourtAccess(courtId, userId);
        return this.prisma.amenities.delete({ where: { id } });
    }

    // SPORTS
    async getSports(courtId: string, userId: string) {
        await this.checkCourtAccess(courtId, userId);
        return this.prisma.sport_assignments.findMany({
            where: { court_id: courtId }
        });
    }

    async createSport(courtId: string, userId: string, data: any) {
        await this.checkCourtAccess(courtId, userId);
        
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

    async deleteSport(id: string, courtId: string, userId: string) {
        await this.checkCourtAccess(courtId, userId);
        return this.prisma.sport_assignments.delete({ where: { id } });
    }
}
