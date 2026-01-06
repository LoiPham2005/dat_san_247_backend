import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { ReviewFilterDto } from './dto/review-filter.dto';

@Injectable()
export class ReviewsService {
    constructor(
        @InjectRepository(Review)
        private reviewRepository: Repository<Review>,
    ) { }

    async findAll(filter: ReviewFilterDto) {
        const { page = 1, limit = 10, rating, venueId, isVisible } = filter;
        const skip = (page - 1) * limit;

        const query = this.reviewRepository.createQueryBuilder('review')
            .leftJoinAndSelect('review.user', 'user')
            .leftJoinAndSelect('review.venue', 'venue')
            .leftJoinAndSelect('review.booking', 'booking');

        if (rating) query.andWhere('review.rating = :rating', { rating });
        if (venueId) query.andWhere('review.venueId = :venueId', { venueId });
        if (isVisible !== undefined) {
            query.andWhere('review.isVisible = :isVisible', { isVisible: isVisible === 'true' });
        }

        const [items, total] = await query
            .orderBy('review.createdAt', 'DESC')
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
        const review = await this.reviewRepository.findOne({
            where: { id },
            relations: ['user', 'venue', 'images']
        });
        if (!review) throw new NotFoundException('Review not found');
        return review;
    }

    async toggleVisibility(id: string, isVisible?: boolean) {
        const review = await this.findOne(id);
        review.isVisible = isVisible !== undefined ? isVisible : !review.isVisible;
        return this.reviewRepository.save(review);
    }

    async softDelete(id: string) {
        const review = await this.findOne(id);
        return this.reviewRepository.softRemove(review);
    }

    async createReview(userId: string, data: any) {
        const review = this.reviewRepository.create({
            ...data,
            userId,
        });
        return this.reviewRepository.save(review);
    }
}
