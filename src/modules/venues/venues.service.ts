import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venue } from './entities/venue.entity';
import { VenueStaff } from './entities/venue-staff.entity';
import { FavoriteVenue } from './entities/favorite-venue.entity';
import { VenueFilterDto } from './dto/venue-filter.dto';
import { VenueStatus } from '../../common/constants/venue-status.constant';

@Injectable()
export class VenuesService {
    constructor(
        @InjectRepository(Venue)
        private venueRepository: Repository<Venue>,
        @InjectRepository(VenueStaff)
        private venueStaffRepository: Repository<VenueStaff>,
        @InjectRepository(FavoriteVenue)
        private favoriteVenueRepository: Repository<FavoriteVenue>,
    ) { }

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

    async findOne(id: string) {
        const venue = await this.venueRepository.findOne({
            where: { id },
            relations: ['owner', 'images', 'amenities', 'courts', 'courts.images']
        });
        if (!venue) throw new NotFoundException('Venue not found');
        return venue;
    }

    async updateStatus(id: string, status: VenueStatus, reason?: string) {
        const venue = await this.findOne(id);
        venue.status = status;
        if (reason) venue.rejectionReason = reason;
        return this.venueRepository.save(venue);
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
        const { page = 1, limit = 10, status, search } = filter;
        const skip = (page - 1) * limit;

        const query = this.venueRepository.createQueryBuilder('venue')
            .where('venue.ownerId = :ownerId', { ownerId });

        if (status) query.andWhere('venue.status = :status', { status });
        if (search) query.andWhere('venue.name ILIKE :search', { search: `%${search}%` });

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

    async createOwnerVenue(ownerId: string, data: any) {
        let { name, slug } = data;
        if (!slug && name) {
            slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        }

        // Check if slug exists
        const existing = await this.venueRepository.findOne({ where: { slug } });
        if (existing) {
            // Append random string to slug if duplicate
            slug = `${slug}-${Math.random().toString(36).substring(7)}`;
        }

        const venue = this.venueRepository.create({
            ...data,
            slug,
            ownerId,
            status: VenueStatus.PENDING, // Default status
            isActive: true
        });
        return this.venueRepository.save(venue);
    }

    async updateByOwner(ownerId: string, id: string, data: any) {
        const venue = await this.findOneByOwner(ownerId, id);
        Object.assign(venue, data);
        return this.venueRepository.save(venue);
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
