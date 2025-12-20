// modules/reviews/reviews.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review, ReviewStatus } from './entities/review.entity';
import { Venue } from '../venues/entities/venue.entity';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';
import { CreateReviewDto, UpdateReviewDto, OwnerResponseDto } from './dto/create-review.dto';
import { VenuesService } from '../venues/venues.service';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Venue)
    private venueRepository: Repository<Venue>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    private venuesService: VenuesService,
  ) {}

  async create(userId: string, createReviewDto: CreateReviewDto): Promise<Review> {
    // Check if venue exists
    const venue = await this.venueRepository.findOne({
      where: { id: createReviewDto.venueId },
    });

    if (!venue) {
      throw new NotFoundException('Venue not found');
    }

    // Check if user has already reviewed this venue
    const existingReview = await this.reviewRepository.findOne({
      where: {
        venueId: createReviewDto.venueId,
        userId,
      },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this venue');
    }

    // Verify booking if provided
    let isVerifiedBooking = false;
    if (createReviewDto.bookingId) {
      const booking = await this.bookingRepository.findOne({
        where: {
          id: createReviewDto.bookingId,
          userId,
          status: BookingStatus.COMPLETED,
        },
      });

      if (booking) {
        isVerifiedBooking = true;
      }
    }

    const review = this.reviewRepository.create({
      ...createReviewDto,
      userId,
      isVerifiedBooking,
      status: ReviewStatus.PENDING,
    });

    const savedReview = await this.reviewRepository.save(review);

    // Update venue rating
    await this.updateVenueRating(createReviewDto.venueId);

    return savedReview;
  }

  async findByVenue(
    venueId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<Review>> {
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC' } = paginationDto;

    const query = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .where('review.venue_id = :venueId', { venueId })
      .andWhere('review.status = :status', { status: ReviewStatus.APPROVED })
      .orderBy(`review.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

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

  async findByUser(userId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { userId },
      relations: ['venue'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, userId: string, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id, userId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    Object.assign(review, updateReviewDto);
    const updatedReview = await this.reviewRepository.save(review);

    // Update venue rating
    await this.updateVenueRating(review.venueId);

    return updatedReview;
  }

  async delete(id: string, userId: string): Promise<void> {
    const review = await this.reviewRepository.findOne({
      where: { id, userId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const venueId = review.venueId;
    await this.reviewRepository.delete(id);

    // Update venue rating
    await this.updateVenueRating(venueId);
  }

  async addOwnerResponse(
    reviewId: string,
    ownerId: string,
    responseDto: OwnerResponseDto,
  ): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
      relations: ['venue'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Verify ownership
    if (review.venue.ownerId !== ownerId) {
      throw new BadRequestException('You do not own this venue');
    }

    review.ownerResponse = responseDto.response;
    review.ownerRespondedAt = new Date();

    return this.reviewRepository.save(review);
  }

  async likeReview(reviewId: string, userId: string): Promise<void> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    review.likesCount += 1;
    await this.reviewRepository.save(review);
  }

  async approveReview(reviewId: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    review.status = ReviewStatus.APPROVED;
    return this.reviewRepository.save(review);
  }

  private async updateVenueRating(venueId: string): Promise<void> {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'average')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.venue_id = :venueId', { venueId })
      .andWhere('review.status = :status', { status: ReviewStatus.APPROVED })
      .getRawOne();

    const ratingAverage = parseFloat(result.average) || 0;
    const totalReviews = parseInt(result.count) || 0;

    await this.venueRepository.update(venueId, {
      ratingAverage,
      totalReviews,
    });
  }
}
