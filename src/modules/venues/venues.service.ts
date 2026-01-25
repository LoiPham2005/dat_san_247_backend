import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Venue } from './entities/venue.entity';
import { PricingRule } from '../time-slots/entities/pricing-rule.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { BookingStatus } from '../../common/constants/booking-status.constant';
import { DayOfWeek } from '../../common/constants/day-of-week.constant';
import { VenueStaff } from './entities/venue-staff.entity';
import { FavoriteVenue } from './entities/favorite-venue.entity';
import { VenueImage } from './entities/venue-image.entity';
import { VenueAmenity } from './entities/venue-amenity.entity';
import { VenueFilterDto } from './dto/venue-filter.dto';
import { VenueStatus } from '../../common/constants/venue-status.constant';
import { StorageService } from '../../shared/storage/storage.service';
import { CreateVenueDto, UpdateVenueDto } from './dto/create-venue.dto';
import { AnalyticsService } from '../analytics/analytics.service';
import { ActivityType } from '../../common/constants/activity-type.constant';

@Injectable()
export class VenuesService {
    constructor(
        @InjectRepository(Venue)
        private venueRepository: Repository<Venue>,
        @InjectRepository(VenueStaff)
        private venueStaffRepository: Repository<VenueStaff>,
        @InjectRepository(FavoriteVenue)
        private favoriteVenueRepository: Repository<FavoriteVenue>,
        @InjectRepository(VenueImage)
        private venueImageRepository: Repository<VenueImage>,
        @InjectRepository(VenueAmenity)
        private venueAmenityRepository: Repository<VenueAmenity>,
        @InjectRepository(PricingRule)
        private pricingRuleRepository: Repository<PricingRule>,
        @InjectRepository(Booking)
        private bookingRepository: Repository<Booking>,
        private storageService: StorageService,
        private dataSource: DataSource,
        private analyticsService: AnalyticsService,
    ) { }

    async getAvailability(venueId: string, dateStr: string) {
        const date = new Date(dateStr);
        const dayOfWeek = this.getDayOfWeek(date);

        const venue = await this.venueRepository.findOne({
            where: { id: venueId },
            relations: ['courts', 'courts.pricingRules']
        });

        if (!venue) throw new NotFoundException('Venue not found');

        const bookings = await this.bookingRepository.find({
            where: {
                venueId,
                bookingDate: dateStr as any,
                status: In([BookingStatus.CONFIRMED, BookingStatus.PENDING, BookingStatus.CHECKED_IN] as any)
            }
        });

        const openingTime = venue.openingTime || '06:00:00';
        const closingTime = venue.closingTime || '22:00:00';
        const slots = this.generateTimeSlots(openingTime, closingTime);

        const availability = venue.courts.map(court => {
            const courtBookings = bookings.filter(b => b.courtId === court.id);
            const courtPricingRules = court.pricingRules.filter(r => r.dayOfWeek === dayOfWeek && r.isActive);

            const courtSlots = slots.map(slotTime => {
                const isBooked = courtBookings.some(b => {
                    const bStart = b.startTime;
                    const bEnd = b.endTime;
                    return slotTime >= bStart && slotTime < bEnd;
                });

                // Find applicable price for this slot
                const applicableRule = courtPricingRules.find(r =>
                    slotTime >= r.startTime && slotTime < r.endTime
                );

                // If no rule, use default court price (prorated to 30 mins)
                const price = applicableRule ? applicableRule.price / 2 : court.pricePerHour / 2;

                return {
                    time: slotTime.substring(0, 5),
                    available: !isBooked,
                    price: Number(price)
                };
            });

            return {
                courtId: court.id,
                courtName: court.name,
                sportType: court.sportType,
                pricePerHour: court.pricePerHour,
                slots: courtSlots
            };
        });

        return {
            venueId,
            date: dateStr,
            openingTime: openingTime.substring(0, 5),
            closingTime: closingTime.substring(0, 5),
            courts: availability
        };
    }

    private getDayOfWeek(date: Date): DayOfWeek {
        const days = [DayOfWeek.SUNDAY, DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY];
        return days[date.getDay()];
    }

    private generateTimeSlots(start: string, end: string): string[] {
        const slots: string[] = [];
        let current = start;

        while (current < end) {
            slots.push(current);
            const [h, m, s] = current.split(':').map(Number);
            let nextH = h;
            let nextM = m + 30;
            if (nextM >= 60) {
                nextH++;
                nextM = 0;
            }
            if (nextH >= 24) break;
            current = `${nextH.toString().padStart(2, '0')}:${nextM.toString().padStart(2, '0')}:00`;
        }

        return slots;
    }

    async findAll(filter: VenueFilterDto) {
        const { page = 1, limit = 10, status, search, city, sportType, minPrice, maxPrice, rating, amenities: amenityFilter } = filter;
        const skip = (page - 1) * limit;

        const query = this.venueRepository.createQueryBuilder('venue')
            .leftJoinAndSelect('venue.owner', 'owner')
            .leftJoinAndSelect('venue.images', 'images')
            .leftJoinAndSelect('venue.amenities', 'amenities')
            .leftJoinAndSelect('venue.courts', 'courts');

        if (status) {
            query.andWhere('venue.status = :status', { status });
        }

        if (search) {
            query.andWhere('(venue.name ILIKE :search OR venue.address ILIKE :search)', { search: `%${search}%` });
        }

        if (city) {
            query.andWhere('venue.city = :city', { city });
        }

        if (sportType) {
            query.andWhere('courts.sportType = :sportType', { sportType });
        }

        if (minPrice) {
            query.andWhere('courts.pricePerHour >= :minPrice', { minPrice });
        }

        if (maxPrice) {
            query.andWhere('courts.pricePerHour <= :maxPrice', { maxPrice });
        }

        if (rating) {
            query.andWhere('venue.rating >= :rating', { rating });
        }

        if (amenityFilter) {
            const amenityList = amenityFilter.split(',').map(a => a.trim());
            query.andWhere('amenities.name IN (:...amenityList)', { amenityList });
        }

        const [items, total] = await query
            .orderBy('venue.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        const totalPages = Math.ceil(total / limit);

        return {
            items,
            meta: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        };
    }

    async findOne(id: string, userId?: string) {
        const venue = await this.venueRepository.findOne({
            where: { id },
            relations: ['owner', 'images', 'amenities', 'courts', 'courts.images', 'courts.pricingRules']
        });
        if (!venue) throw new NotFoundException('Venue not found');

        // Add isFavorited if userId is provided
        let isFavorited = false;
        if (userId) {
            const favorite = await this.favoriteVenueRepository.findOne({
                where: { userId, venueId: id }
            });
            isFavorited = !!favorite;
        }

        return { ...venue, isFavorited };
    }

    async update(id: string, data: any) {
        await this.venueRepository.update(id, data);
        return this.findOne(id);
    }


    async updateStatus(id: string, status: VenueStatus, reason?: string, userId?: string) {
        const venue = await this.findOne(id);
        venue.status = status;
        if (reason) venue.rejectionReason = reason;
        const savedVenue = await this.venueRepository.save(venue);

        // Log activity if userId is provided
        if (userId) {
            await this.analyticsService.logActivity({
                userId,
                activityType: status === VenueStatus.APPROVED ? ActivityType.VENUE_APPROVED : ActivityType.VENUE_REJECTED,
                entityType: 'VENUE',
                entityId: id,
                description: `${status === VenueStatus.APPROVED ? 'Approved' : 'Rejected'} venue: ${venue.name}${reason ? `. Reason: ${reason}` : ''}`,
                metadata: { status, reason }
            });
        }

        return savedVenue;
    }

    async toggleFeatured(id: string) {
        const venue = await this.findOne(id);
        venue.isFeatured = !venue.isFeatured;
        return this.venueRepository.save(venue);
    }

    async softDelete(id: string) {
        const venue = await this.findOne(id);
        return this.venueRepository.softRemove(venue);
    }

    async findAllByOwner(ownerId: string, filter: VenueFilterDto) {
        const { page = 1, limit = 10, status, search, city, sportType, minPrice, maxPrice } = filter;
        const skip = (page - 1) * limit;

        const query = this.venueRepository.createQueryBuilder('venue')
            .leftJoinAndSelect('venue.courts', 'courts')
            .leftJoinAndSelect('venue.images', 'images')
            .where('venue.ownerId = :ownerId', { ownerId });

        if (status) query.andWhere('venue.status = :status', { status });
        if (search) query.andWhere('venue.name ILIKE :search', { search: `%${search}%` });
        if (city) query.andWhere('venue.city = :city', { city });
        if (sportType) query.andWhere('courts.sportType = :sportType', { sportType });
        if (minPrice) query.andWhere('courts.pricePerHour >= :minPrice', { minPrice });
        if (maxPrice) query.andWhere('courts.pricePerHour <= :maxPrice', { maxPrice });

        const [items, total] = await query
            .orderBy('venue.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        const totalPages = Math.ceil(total / limit);

        return {
            items,
            meta: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
        };
    }

    async findOneByOwner(ownerId: string, id: string) {
        const venue = await this.venueRepository.findOne({
            where: { id, ownerId },
            relations: ['images', 'amenities', 'courts', 'courts.images', 'courts.pricingRules']
        });
        if (!venue) throw new NotFoundException('Venue not found or not owned by user');
        return venue;
    }

    async createOwnerVenue(ownerId: string, dto: CreateVenueDto, files: { thumbnail?: any, images?: any[] }) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            let { name } = dto;
            let slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

            // Check if slug exists
            const existing = await queryRunner.manager.findOne(Venue, { where: { slug } });
            if (existing) {
                slug = `${slug}-${Math.random().toString(36).substring(7)}`;
            }

            // 1. Upload Thumbnail if exists
            let thumbnailUrl: string | undefined = undefined;
            if (files.thumbnail) {
                thumbnailUrl = await this.storageService.uploadFile(files.thumbnail, 'venues/thumbnails');
            }

            // 2. Create Venue
            const { amenities, ...venueDto } = dto;
            const venueData: Partial<Venue> = {
                ...venueDto,
                slug,
                ownerId,
                thumbnailUrl,
                status: VenueStatus.PENDING,
                isActive: true
            };
            const venue = queryRunner.manager.create(Venue, venueData);
            const savedVenue = await queryRunner.manager.save(venue);

            // 3. Upload and Save Images
            if (files.images && files.images.length > 0) {
                const imageEntities: VenueImage[] = [];
                for (let i = 0; i < files.images.length; i++) {
                    const url = await this.storageService.uploadFile(files.images[i], `venues/${savedVenue.id}/gallery`);
                    imageEntities.push(
                        queryRunner.manager.create(VenueImage, {
                            venueId: savedVenue.id,
                            imageUrl: url,
                            displayOrder: i
                        })
                    );
                }
                await queryRunner.manager.save(VenueImage, imageEntities);
            }

            // 4. Save Amenities
            if (amenities && amenities.length > 0) {
                const amenityEntities = amenities.map(name =>
                    queryRunner.manager.create(VenueAmenity, {
                        venueId: savedVenue.id,
                        name
                    })
                );
                await queryRunner.manager.save(VenueAmenity, amenityEntities);
            }

            await queryRunner.commitTransaction();
            return this.findOneByOwner(ownerId, savedVenue.id);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async updateByOwner(ownerId: string, id: string, dto: UpdateVenueDto, files: { thumbnail?: any, images?: any[] } = {}) {
        const venue = await this.findOneByOwner(ownerId, id);
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const { amenities, ...venueDto } = dto;

            // 1. Handle Thumbnail Update
            if (files.thumbnail) {
                // Delete old thumbnail if exists (optional but recommended)
                if (venue.thumbnailUrl) {
                    await this.storageService.deleteFile(venue.thumbnailUrl).catch(() => { });
                }
                const thumbnailUrl = await this.storageService.uploadFile(files.thumbnail, 'venues/thumbnails');
                venue.thumbnailUrl = thumbnailUrl;
            }

            // 2. Handle Gallery Images (Append or Replace? Usually Replace if provided or just append. I'll Replace for simplicity or better UI experience)
            if (files.images && files.images.length > 0) {
                // For a robust system, we might want to delete specific images.
                // Here I'll just append new ones. Or if the user wants to replace, they'd need a different API.
                // Let's just append for now.
                const imageEntities: VenueImage[] = [];
                for (let i = 0; i < files.images.length; i++) {
                    const url = await this.storageService.uploadFile(files.images[i], `venues/${id}/gallery`);
                    imageEntities.push(
                        queryRunner.manager.create(VenueImage, {
                            venue,
                            imageUrl: url,
                            displayOrder: (venue.images?.length || 0) + i
                        })
                    );
                }
                await queryRunner.manager.save(VenueImage, imageEntities);
            }

            // 3. Handle Amenities Update (Replace existing)
            if (amenities !== undefined) {
                // Delete existing amenities from DB first
                await queryRunner.manager.delete(VenueAmenity, { venueId: id });

                let amenityEntities: VenueAmenity[] = [];
                if (amenities.length > 0) {
                    amenityEntities = amenities.map(name =>
                        queryRunner.manager.create(VenueAmenity, {
                            venue,
                            name
                        })
                    );
                    await queryRunner.manager.save(VenueAmenity, amenityEntities);
                }
                venue.amenities = amenityEntities;
            }

            // 4. Update basic info
            Object.assign(venue, venueDto);
            // Optimization: Remove relations from the object to prevent TypeORM from trying to update them again during save()
            const { images, amenities: _, courts, ...saveData } = venue;
            const updatedVenue = await queryRunner.manager.save(Venue, saveData);

            await queryRunner.commitTransaction();
            return this.findOneByOwner(ownerId, id);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async softDeleteByOwner(ownerId: string, id: string) {
        const venue = await this.findOneByOwner(ownerId, id);
        return this.venueRepository.softRemove(venue);
    }

    async findAllStaffByOwner(ownerId: string) {
        return this.venueStaffRepository.createQueryBuilder('staff')
            .innerJoinAndSelect('staff.venue', 'venue')
            .innerJoinAndSelect('staff.user', 'user')
            .where('venue.ownerId = :ownerId', { ownerId })
            .getMany();
    }

    async createStaff(ownerId: string, data: any) {
        const { venueId, userId } = data;
        await this.findOneByOwner(ownerId, venueId);
        const staff = this.venueStaffRepository.create({ venueId, userId });
        return this.venueStaffRepository.save(staff);
    }

    async removeStaff(ownerId: string, id: string) {
        const staff = await this.venueStaffRepository.findOne({
            where: { id },
            relations: ['venue']
        });
        if (!staff || staff.venue.ownerId !== ownerId) {
            throw new NotFoundException('Staff assignment not found or not authorized');
        }
        return this.venueStaffRepository.remove(staff);
    }

    async findFeatured() {
        return this.venueRepository.find({
            where: { isFeatured: true, status: VenueStatus.APPROVED },
            take: 10,
            relations: ['images']
        });
    }

    async findMyFavorites(userId: string) {
        const favorites = await this.favoriteVenueRepository.find({
            where: { userId },
            relations: ['venue', 'venue.images']
        });
        return favorites.map(f => f.venue);
    }

    async toggleFavorite(userId: string, venueId: string, isFavorite: boolean) {
        if (isFavorite) {
            const exists = await this.favoriteVenueRepository.findOne({ where: { userId, venueId } });
            if (!exists) {
                const fav = this.favoriteVenueRepository.create({ userId, venueId });
                await this.favoriteVenueRepository.save(fav);
            }
        } else {
            await this.favoriteVenueRepository.delete({ userId, venueId });
        }
        return { success: true };
    }

    async getVenueReviews(venueId: string, pagination: any) {
        const { page = 1, limit = 10 } = pagination;
        const skip = (page - 1) * limit;

        const [items, total] = await this.venueRepository.manager.createQueryBuilder('reviews', 'review')
            .leftJoinAndSelect('review.user', 'user')
            .leftJoinAndSelect('review.images', 'images')
            .where('review.venueId = :venueId', { venueId })
            .andWhere('review.isVisible = true')
            .orderBy('review.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        return {
            items,
            meta: { total, page, limit }
        };
    }

    async getAssignedVenueIds(userId: string): Promise<string[]> {
        const assignments = await this.venueStaffRepository.find({
            where: { userId },
            select: ['venueId']
        });
        return assignments.map(a => a.venueId);
    }

    async findByIds(ids: string[]) {
        if (ids.length === 0) return [];
        return this.venueRepository.createQueryBuilder('venue')
            .where('venue.id IN (:...ids)', { ids })
            .leftJoinAndSelect('venue.images', 'images')
            .getMany();
    }
}
