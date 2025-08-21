import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
  ) {}

  create(createDto: CreateReviewDto) {
    const review = this.reviewRepo.create(createDto);
    return this.reviewRepo.save(review);
  }

  findAll() {
    return this.reviewRepo.find({ relations: ['booking', 'customer', 'venue'], order: { createdAt: 'DESC' } });
  }

  findOne(reviewId: number) {
    return this.reviewRepo.findOne({ where: { reviewId }, relations: ['booking', 'customer', 'venue'] });
  }

  findByVenue(venueId: number) {
    return this.reviewRepo.find({ where: { venueId }, order: { createdAt: 'DESC' } });
  }

  update(reviewId: number, updateDto: UpdateReviewDto) {
    return this.reviewRepo.update({ reviewId }, updateDto);
  }

  remove(reviewId: number) {
    return this.reviewRepo.delete({ reviewId });
  }
}
