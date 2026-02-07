import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { VenuesService } from '../venues/venues.service';
import { StorageService } from '../../shared/storage/storage.service';

@Injectable()
export class CourtsService {
    constructor(
        private prisma: PrismaService,
        private venuesService: VenuesService,
        private storageService: StorageService,
    ) { }

    private mapCourt(court: any) {
        if (!court) return null;
        const { pricing_rules, court_images, ...rest } = court;

        let images = [];
        if (court_images) {
            images = court_images.map((img: any) => img.files ? img.files.public_url : null).filter(Boolean);
        } else if (court.images) {
            images = court.images;
        }

        return {
            ...rest,
            id: court.id,
            venueId: court.venue_id,
            name: court.name,
            sportTypes: court.sport_types,
            surfaceType: court.surface_type,
            pricePerHour: Number(court.price_per_hour),
            isActive: court.is_active,
            createdAt: court.created_at,
            updatedAt: court.updated_at,
            amenities: court.amenities,
            images,
            description: court.description,
            // relations
            venue: court.venues ? this.mapVenue(court.venues) : undefined,
            pricingRules: pricing_rules ? pricing_rules.map((r: any) => this.mapPricingRule(r)) : undefined,
        };
    }

    private mapVenue(venue: any) {
        return {
            ...venue,
            ownerId: venue.owner_id,
            // ... minimal mapping for check
        };
    }

    private mapPricingRule(rule: any) {
        return {
            ...rule,
            courtId: rule.court_id,
            dayOfWeek: rule.day_of_week,
            startTime: this.formatTime(rule.start_time),
            endTime: this.formatTime(rule.end_time),
            price: rule.price,
            isActive: rule.is_active,
        };
    }

    private formatTime(date: Date | string): string {
        if (!date) return '';
        if (typeof date === 'string') return date;
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        const seconds = date.getUTCSeconds().toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }

    private parseTime(time: string | Date): Date {
        if (time instanceof Date) return time;
        if (typeof time === 'string') {
            const [hours, minutes, seconds] = time.split(':').map(Number);
            const date = new Date();
            date.setUTCHours(hours || 0, minutes || 0, seconds || 0, 0);
            return date;
        }
        return new Date();
    }

    async findAllByVenue(venueId: string) {
        const courts = await this.prisma.courts.findMany({
            where: { venue_id: venueId, is_active: true },
            include: { pricing_rules: true }
        });
        return courts.map(c => this.mapCourt(c));
    }

    async findOne(id: string) {
        const court = await (this.prisma.courts as any).findUnique({
            where: { id },
            include: {
                venues: true,
                pricing_rules: true,
                court_images: {
                    include: {
                        files: true
                    }
                }
            }
        });
        if (!court) throw new NotFoundException('Court not found');
        return this.mapCourt(court);
    }

    async create(ownerId: string, data: any) {
        // Verify owner
        await this.venuesService.findOneByOwner(ownerId, data.venueId);

        const { venueId, pricingRules, images, ...courtData } = data;

        const createdCourt = await this.prisma.$transaction(async (tx) => {
            const court = await tx.courts.create({
                data: {
                    venue_id: venueId,
                    name: courtData.name,
                    sport_types: courtData.sportTypes || (courtData.sportType ? [courtData.sportType] : []),
                    surface_type: courtData.surfaceType,
                    price_per_hour: courtData.pricePerHour,
                    description: courtData.description,
                    amenities: courtData.amenities,
                    is_active: true,
                }
            });

            if (images && Array.isArray(images)) {
                for (let i = 0; i < images.length; i++) {
                    await (tx.files as any).create({
                        data: {
                            user_id: ownerId,
                            original_name: `court-${court.id}-${i}`,
                            file_name: `court-${court.id}-${i}`,
                            public_url: images[i],
                            file_size: 0,
                            mime_type: 'image/jpeg',
                            target_type: 'COURT',
                            target_id: court.id,
                            display_order: i,
                            category: 'COURT_IMAGE' as any
                        }
                    });
                }
            }

            if (pricingRules && Array.isArray(pricingRules)) {
                await tx.pricing_rules.createMany({
                    data: pricingRules.map(rule => ({
                        court_id: court.id,
                        day_of_week: rule.dayOfWeek,
                        start_time: this.parseTime(rule.startTime),
                        end_time: this.parseTime(rule.endTime),
                        price: rule.price,
                        is_active: true
                    }))
                });
            }
            return court;
        });

        return this.findOne(createdCourt.id);
    }

    async update(ownerId: string, id: string, data: any) {
        const courtCheck = await this.prisma.courts.findUnique({
            where: { id },
            include: { venues: true }
        });

        if (!courtCheck) throw new NotFoundException('Court not found');
        if (courtCheck.venues.owner_id !== ownerId) {
            throw new ForbiddenException('You do not have permission to update this court');
        }

        const { pricingRules, images, ...courtData } = data;

        await this.prisma.$transaction(async (tx) => {
            await tx.courts.update({
                where: { id },
                data: {
                    name: courtData.name,
                    sport_types: courtData.sportTypes || (courtData.sportType ? [courtData.sportType] : []),
                    surface_type: courtData.surfaceType,
                    price_per_hour: courtData.pricePerHour,
                    description: courtData.description,
                    amenities: courtData.amenities,
                    is_active: courtData.isActive,
                }
            });

            if (images && Array.isArray(images)) {
                // Delete old images relation or manage them
                await (tx.files as any).deleteMany({
                    where: { target_type: 'COURT', target_id: id }
                });
                for (let i = 0; i < images.length; i++) {
                    await (tx.files as any).create({
                        data: {
                            user_id: ownerId,
                            original_name: `court-${id}-${i}`,
                            file_name: `court-${id}-${i}`,
                            public_url: images[i],
                            file_size: 0,
                            mime_type: 'image/jpeg',
                            target_type: 'COURT',
                            target_id: id,
                            display_order: i,
                            category: 'COURT_IMAGE' as any
                        }
                    });
                }
            }

            if (pricingRules && Array.isArray(pricingRules)) {
                await tx.pricing_rules.deleteMany({ where: { court_id: id } });
                await tx.pricing_rules.createMany({
                    data: pricingRules.map(rule => ({
                        court_id: id,
                        day_of_week: rule.dayOfWeek,
                        start_time: this.parseTime(rule.startTime),
                        end_time: this.parseTime(rule.endTime),
                        price: rule.price,
                        is_active: true
                    }))
                });
            }
        });

        return this.findOne(id);
    }

    async softDelete(ownerId: string, id: string) {
        const court = await this.prisma.courts.findUnique({
            where: { id },
            include: { venues: true }
        });
        if (!court) throw new NotFoundException('Court not found');
        if (court.venues.owner_id !== ownerId) {
            throw new ForbiddenException('You do not have permission to delete this court');
        }

        await this.prisma.courts.update({
            where: { id },
            data: {
                deleted_at: new Date(),
                is_active: false
            }
        });
        return { success: true };
    }

    async getPricingRules(courtId: string) {
        const rules = await this.prisma.pricing_rules.findMany({
            where: { court_id: courtId, is_active: true },
            orderBy: [{ day_of_week: 'asc' }, { start_time: 'asc' }]
        });
        return rules.map(r => this.mapPricingRule(r));
    }

    async updatePricingRules(ownerId: string, courtId: string, rules: any[]) {
        const court = await this.prisma.courts.findUnique({
            where: { id: courtId },
            include: { venues: true }
        });
        if (!court) throw new NotFoundException('Court not found');
        if (court.venues.owner_id !== ownerId) {
            throw new ForbiddenException('You do not have permission to update pricing rules for this court');
        }

        await this.prisma.$transaction(async (tx) => {
            await tx.pricing_rules.deleteMany({ where: { court_id: courtId } });
            if (rules.length > 0) {
                await tx.pricing_rules.createMany({
                    data: rules.map(rule => ({
                        court_id: courtId,
                        day_of_week: rule.dayOfWeek,
                        start_time: rule.startTime,
                        end_time: rule.endTime,
                        price: rule.price,
                        is_active: true
                    }))
                });
            }
        });

        return this.getPricingRules(courtId);
    }
}
