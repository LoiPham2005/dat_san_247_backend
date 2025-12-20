import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Between, In } from 'typeorm';
import { SearchHistory } from './entities/search-history.entity';
import { CreateSearchHistoryDto } from './dto/create-search-history.dto';
import { SearchFilterDto } from './dto/search-filter.dto';
import { SearchVenueDto } from './dto/search-venue.dto';
import { Venue } from '../venues/entities/venue.entity';
import { Court } from '../courts/entities/court.entity';
import { SportType } from '../sport-types/entities/sport-type.entity';

import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    @InjectRepository(SearchHistory)
    private searchHistoryRepository: Repository<SearchHistory>,
    @InjectRepository(Venue)
    private venueRepository: Repository<Venue>,
    @InjectRepository(Court)
    private courtRepository: Repository<Court>,
    @InjectRepository(SportType)
    private sportTypeRepository: Repository<SportType>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) { }

  // =====================================================
  // CREATE - Tạo lịch sử tìm kiếm
  // =====================================================
  async recordSearch(
    dto: CreateSearchHistoryDto,
    resultCount: number = 0,
  ): Promise<SearchHistory> {
    this.logger.log(`Recording search: ${dto.searchQuery}`);

    const searchHistory = this.searchHistoryRepository.create({
      ...dto,
      resultCount,
      searchDate: new Date(),
    });

    return this.searchHistoryRepository.save(searchHistory);
  }

  // =====================================================
  // READ - Lấy tất cả lịch sử tìm kiếm
  // =====================================================
  async findAll(filters?: SearchFilterDto): Promise<SearchHistory[]> {
    const query = this.searchHistoryRepository
      .createQueryBuilder('search')
      .leftJoinAndSelect('search.user', 'user')
      .leftJoinAndSelect('search.sportType', 'sportType')
      .orderBy('search.createdAt', 'DESC')
      .take(100);

    if (filters?.userId) {
      query.andWhere('search.userId = :userId', { userId: filters.userId });
    }

    if (filters?.query) {
      query.andWhere('search.searchQuery ILIKE :query', {
        query: `%${filters.query}%`,
      });
    }

    if (filters?.city) {
      query.andWhere('search.city = :city', { city: filters.city });
    }

    if (filters?.sportTypeId) {
      query.andWhere('search.sportTypeId = :sportTypeId', {
        sportTypeId: filters.sportTypeId,
      });
    }

    return query.getMany();
  }

  // =====================================================
  // READ - Lấy lịch sử tìm kiếm của user
  // =====================================================
  async getUserSearchHistory(
    userId: string,
    limit: number = 20,
  ): Promise<SearchHistory[]> {
    return this.searchHistoryRepository.find({
      where: { userId },
      relations: ['sportType'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  // =====================================================
  // READ - Lấy tìm kiếm phổ biến
  // =====================================================
  async getTrendingSearches(limit: number = 10): Promise<any[]> {
    const cacheKey = `trending_searches_${limit}`;
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      return cached as any[];
    }

    const trending = await this.searchHistoryRepository
      .createQueryBuilder('search')
      .select('search.searchQuery', 'query')
      .addSelect('COUNT(*)', 'count')
      .groupBy('search.searchQuery')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();

    // Cache 1 giờ
    await this.cacheManager.set(cacheKey, trending, 3600000);

    return trending;
  }

  // =====================================================
  // READ - Lấy gợi ý tìm kiếm
  // =====================================================
  async getSearchSuggestions(query: string, limit: number = 10): Promise<string[]> {
    const cacheKey = `suggestions_${query}_${limit}`;
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      return cached as string[];
    }

    const suggestions = await this.searchHistoryRepository
      .createQueryBuilder('search')
      .select('DISTINCT search.searchQuery', 'query')
      .where('search.searchQuery ILIKE :query', { query: `${query}%` })
      .orderBy('search.createdAt', 'DESC')
      .limit(limit)
      .getRawMany();

    const result = suggestions.map((s) => s.query);

    // Cache 30 phút
    await this.cacheManager.set(cacheKey, result, 1800000);

    return result;
  }

  // =====================================================
  // READ - Tìm kiếm sân
  // =====================================================
  async searchVenues(searchDto: SearchVenueDto): Promise<any> {
    this.logger.log(`Searching venues: ${JSON.stringify(searchDto)}`);

    const cacheKey = `venue_search_${JSON.stringify(searchDto)}`;
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      return cached;
    }

    const page = searchDto.page || 1;
    const limit = searchDto.limit || 10;
    const skip = (page - 1) * limit;

    const query = this.venueRepository
      .createQueryBuilder('venue')
      .leftJoinAndSelect('venue.courts', 'courts')
      .leftJoinAndSelect('venue.reviews', 'reviews')
      .leftJoinAndSelect('venue.images', 'images')
      .where('venue.status = :status', { status: 'active' });

    // Text search
    if (searchDto.search) {
      query.andWhere(
        '(venue.venueName ILIKE :search OR venue.description ILIKE :search OR venue.address ILIKE :search)',
        { search: `%${searchDto.search}%` }
      );
    }

    // Location filters
    if (searchDto.city) {
      query.andWhere('venue.city = :city', { city: searchDto.city });
    }

    if (searchDto.district) {
      query.andWhere('venue.district = :district', { district: searchDto.district });
    }

    // Sport type filter
    if (searchDto.sportTypeId) {
      query.andWhere('courts.sportTypeId = :sportTypeId', {
        sportTypeId: searchDto.sportTypeId,
      });
    }

    // Rating filter
    if (searchDto.minRating) {
      query.andWhere('venue.ratingAverage >= :minRating', {
        minRating: searchDto.minRating,
      });
    }

    // Price range filter
    if (searchDto.minPrice || searchDto.maxPrice) {
      const minPrice = searchDto.minPrice || 0;
      const maxPrice = searchDto.maxPrice || 999999;
      query.andWhere('courts.pricePerHour BETWEEN :minPrice AND :maxPrice', {
        minPrice,
        maxPrice,
      });
    }

    // Amenities filters
    if (searchDto.parkingAvailable) {
      query.andWhere('venue.parkingAvailable = :parkingAvailable', {
        parkingAvailable: true,
      });
    }

    if (searchDto.wifiAvailable) {
      query.andWhere('venue.wifiAvailable = :wifiAvailable', {
        wifiAvailable: true,
      });
    }

    if (searchDto.showerAvailable) {
      query.andWhere('venue.showerAvailable = :showerAvailable', {
        showerAvailable: true,
      });
    }

    // Featured filter
    if (searchDto.featured) {
      query.andWhere('venue.featured = :featured', { featured: true });
    }

    // Location-based search
    if (searchDto.latitude && searchDto.longitude && searchDto.radius) {
      const radius = searchDto.radius;
      query.andWhere(
        `(6371 * acos(cos(radians(:lat)) * cos(radians(venue.latitude)) * cos(radians(venue.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(venue.latitude)))) <= :radius`,
        {
          lat: searchDto.latitude,
          lng: searchDto.longitude,
          radius,
        }
      );
    }

    // Sorting
    const sortBy = searchDto.sortBy || 'createdAt';
    const sortOrder = searchDto.sortOrder || 'DESC';

    if (sortBy === 'rating') {
      query.orderBy('venue.ratingAverage', sortOrder);
    } else if (sortBy === 'popular') {
      query.orderBy('venue.totalBookings', 'DESC');
    } else if (sortBy === 'price') {
      query.orderBy('courts.pricePerHour', sortOrder);
    } else {
      query.orderBy(`venue.${sortBy}`, sortOrder);
    }

    query.skip(skip).take(limit);

    const [venues, total] = await query.getManyAndCount();

    const result = {
      data: venues,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Cache 10 phút
    await this.cacheManager.set(cacheKey, result, 600000);

    return result;
  }

  // =====================================================
  // READ - Tìm kiếm sân bóng
  // =====================================================
  async searchCourts(searchDto: SearchVenueDto): Promise<any> {
    const page = searchDto.page || 1;
    const limit = searchDto.limit || 10;
    const skip = (page - 1) * limit;

    const query = this.courtRepository
      .createQueryBuilder('court')
      .leftJoinAndSelect('court.venue', 'venue')
      .leftJoinAndSelect('court.sportType', 'sportType')
      .where('court.status = :status', { status: 'active' });

    // Text search
    if (searchDto.search) {
      query.andWhere(
        '(court.courtName ILIKE :search OR court.description ILIKE :search)',
        { search: `%${searchDto.search}%` }
      );
    }

    // Location filters
    if (searchDto.city) {
      query.andWhere('venue.city = :city', { city: searchDto.city });
    }

    if (searchDto.district) {
      query.andWhere('venue.district = :district', { district: searchDto.district });
    }

    // Sport type filter
    if (searchDto.sportTypeId) {
      query.andWhere('court.sportTypeId = :sportTypeId', {
        sportTypeId: searchDto.sportTypeId,
      });
    }

    // Price range filter
    if (searchDto.minPrice || searchDto.maxPrice) {
      const minPrice = searchDto.minPrice || 0;
      const maxPrice = searchDto.maxPrice || 999999;
      query.andWhere('court.pricePerHour BETWEEN :minPrice AND :maxPrice', {
        minPrice,
        maxPrice,
      });
    }

    // Sorting
    const sortBy = searchDto.sortBy || 'createdAt';
    const sortOrder = searchDto.sortOrder || 'DESC';

    if (sortBy === 'price') {
      query.orderBy('court.pricePerHour', sortOrder);
    } else {
      query.orderBy(`court.${sortBy}`, sortOrder);
    }

    query.skip(skip).take(limit);

    const [courts, total] = await query.getManyAndCount();

    return {
      data: courts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // =====================================================
  // READ - Tìm kiếm nâng cao
  // =====================================================
  async advancedSearch(searchDto: SearchVenueDto): Promise<any> {
    const results = {
      venues: await this.searchVenues(searchDto),
      courts: await this.searchCourts(searchDto),
    };

    return results;
  }

  // =====================================================
  // DELETE - Xóa lịch sử tìm kiếm
  // =====================================================
  async deleteSearchHistory(id: string): Promise<void> {
    const search = await this.searchHistoryRepository.findOne({
      where: { id },
    });

    if (!search) {
      throw new NotFoundException('Search history not found');
    }

    await this.searchHistoryRepository.remove(search);
  }

  // =====================================================
  // DELETE - Xóa lịch sử tìm kiếm của user
  // =====================================================
  async clearUserSearchHistory(userId: string): Promise<void> {
    await this.searchHistoryRepository.delete({
      userId,
    });
  }

  // =====================================================
  // DELETE - Xóa lịch sử tìm kiếm cũ
  // =====================================================
  async clearOldSearchHistory(daysOld: number = 90): Promise<void> {
    const date = new Date();
    date.setDate(date.getDate() - daysOld);

    const result = await this.searchHistoryRepository.delete({
      createdAt: Between(new Date('2000-01-01'), date),
    });

    this.logger.log(`Deleted ${result.affected} old search histories`);
  }

  // =====================================================
  // STATISTICS - Lấy thống kê tìm kiếm
  // =====================================================
  async getSearchStatistics(userId?: string): Promise<any> {
    const query = this.searchHistoryRepository.createQueryBuilder('search');

    if (userId) {
      query.where('search.userId = :userId', { userId });
    }

    const total = await query.getCount();

    const byType = await this.searchHistoryRepository
      .createQueryBuilder('search')
      .select('search.searchType', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('search.searchType')
      .getRawMany();

    const topQueries = await this.searchHistoryRepository
      .createQueryBuilder('search')
      .select('search.searchQuery', 'query')
      .addSelect('COUNT(*)', 'count')
      .groupBy('search.searchQuery')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    const topCities = await this.searchHistoryRepository
      .createQueryBuilder('search')
      .select('search.city', 'city')
      .addSelect('COUNT(*)', 'count')
      .where('search.city IS NOT NULL')
      .groupBy('search.city')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      total,
      byType,
      topQueries,
      topCities,
    };
  }

  // =====================================================
  // AUTOCOMPLETE - Gợi ý địa điểm
  // =====================================================
  async getLocationSuggestions(query: string): Promise<string[]> {
    const cacheKey = `location_suggestions_${query}`;
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      return cached as string[];
    }

    const venues = await this.venueRepository
      .createQueryBuilder('venue')
      .select('DISTINCT venue.city', 'city')
      .where('venue.city ILIKE :query', { query: `${query}%` })
      .limit(10)
      .getRawMany();

    const districts = await this.venueRepository
      .createQueryBuilder('venue')
      .select('DISTINCT venue.district', 'district')
      .where('venue.district ILIKE :query', { query: `${query}%` })
      .limit(10)
      .getRawMany();

    const suggestions = [
      ...venues.map((v) => v.city),
      ...districts.map((d) => d.district),
    ];

    // Cache 1 giờ
    await this.cacheManager.set(cacheKey, suggestions, 3600000);

    return suggestions;
  }

  // =====================================================
  // AUTOCOMPLETE - Gợi ý loại thể thao
  // =====================================================
  async getSportTypeSuggestions(): Promise<SportType[]> {
    const cacheKey = 'sport_type_suggestions';
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      return cached as SportType[];
    }

    const sportTypes = await this.sportTypeRepository.find({
      order: { sportName: 'ASC' },
    });

    // Cache 24 giờ
    await this.cacheManager.set(cacheKey, sportTypes, 86400000);

    return sportTypes;
  }
}