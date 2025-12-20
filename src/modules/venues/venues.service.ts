// modules/venues/venues.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Between } from 'typeorm';
import { Venue, VenueStatus } from './entities/venue.entity';
import { CreateVenueDto } from './dto/create-venue.dto';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { SearchVenueDto } from './dto/search-venue.dto';

@Injectable()
export class VenuesService {
  constructor(
    @InjectRepository(Venue)
    private venueRepository: Repository<Venue>,
  ) {}

  async create(ownerId: string, createVenueDto: CreateVenueDto): Promise<Venue> {
    // Generate slug from venue name
    const slug = this.generateSlug(createVenueDto.venueName);

    const venue = this.venueRepository.create({
      ...createVenueDto,
      ownerId,
      slug,
      status: VenueStatus.PENDING,
    });

    return this.venueRepository.save(venue);
  }

  async search(searchDto: SearchVenueDto): Promise<PaginatedResult<Venue>> {
    const query = this.venueRepository
      .createQueryBuilder('venue')
      .where('venue.status = :status', { status: VenueStatus.ACTIVE });

    // Text search
    if (searchDto.search) {
      query.andWhere(
        '(venue.venue_name ILIKE :search OR venue.description ILIKE :search OR venue.address ILIKE :search)',
        { search: `%${searchDto.search}%` },
      );
    }

    // Location filters
    if (searchDto.city) {
      query.andWhere('venue.city = :city', { city: searchDto.city });
    }

    if (searchDto.district) {
      query.andWhere('venue.district = :district', {
        district: searchDto.district,
      });
    }

    // Rating filter
    if (searchDto.minRating) {
      query.andWhere('venue.rating_average >= :minRating', {
        minRating: searchDto.minRating,
      });
    }

    // Amenities filters
    if (searchDto.parkingAvailable) {
      query.andWhere('venue.parking_available = :parkingAvailable', {
        parkingAvailable: searchDto.parkingAvailable,
      });
    }

    if (searchDto.wifiAvailable) {
      query.andWhere('venue.wifi_available = :wifiAvailable', {
        wifiAvailable: searchDto.wifiAvailable,
      });
    }

    // Featured filter
    if (searchDto.featured) {
      query.andWhere('venue.featured = :featured', {
        featured: searchDto.featured,
      });
    }

    // Location-based search (nearby venues)
    if (searchDto.latitude && searchDto.longitude && searchDto.radius) {
      const radius = searchDto.radius; // in kilometers
      query.andWhere(
        `(6371 * acos(cos(radians(:lat)) * cos(radians(venue.latitude)) * cos(radians(venue.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(venue.latitude)))) <= :radius`,
        {
          lat: searchDto.latitude,
          lng: searchDto.longitude,
          radius,
        },
      );
    }

    // Sorting
    const sortBy = searchDto.sortBy || 'created_at';
    const sortOrder = searchDto.sortOrder || 'DESC';

    if (sortBy === 'rating') {
      query.orderBy('venue.rating_average', sortOrder);
    } else if (sortBy === 'popular') {
      query.orderBy('venue.total_bookings', 'DESC');
    } else {
      query.orderBy(`venue.${sortBy}`, sortOrder);
    }

    // Pagination
    const page = searchDto.page || 1;
    const limit = searchDto.limit || 10;
    const skip = (page - 1) * limit;

    query.skip(skip).take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Venue> {
    const venue = await this.venueRepository.findOne({
      where: { id },
      relations: ['courts', 'reviews'],
    });

    if (!venue) {
      throw new NotFoundException('Venue not found');
    }

    // Increment view count
    venue.viewCount += 1;
    await this.venueRepository.save(venue);

    return venue;
  }

  async findBySlug(slug: string): Promise<Venue> {
    const venue = await this.venueRepository.findOne({
      where: { slug },
      relations: ['courts', 'reviews'],
    });

    if (!venue) {
      throw new NotFoundException('Venue not found');
    }

    venue.viewCount += 1;
    await this.venueRepository.save(venue);

    return venue;
  }

  async getOwnerVenues(ownerId: string): Promise<Venue[]> {
    return this.venueRepository.find({
      where: { ownerId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateRating(venueId: string, newRating: number) {
    const venue = await this.findOne(venueId);

    const totalRating =
      venue.ratingAverage * venue.totalReviews + newRating;
    venue.totalReviews += 1;
    venue.ratingAverage = totalRating / venue.totalReviews;

    await this.venueRepository.save(venue);
  }

  private generateSlug(venueName: string): string {
    return venueName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}