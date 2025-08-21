import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { success } from 'src/common/helper/response.helper';

@Injectable()
export class ReviewsService {
    constructor(
        @InjectRepository(Review)
        private readonly reviewRepo: Repository<Review>,
    ) { }

    async create(createDto: CreateReviewDto) {
        const review = this.reviewRepo.create(createDto);
        const saved = await this.reviewRepo.save(review);
        return success(saved, 'Tạo review thành công');
    }

    async findAll() {
        const reviews = await this.reviewRepo.find({
            relations: ['booking', 'customer', 'venue'],
            order: { createdAt: 'DESC' },
        });
        return success(reviews, 'Lấy danh sách review thành công');
    }

    async findOne(reviewId: number) {
        const review = await this.reviewRepo.findOne({
            where: { reviewId },
            relations: ['booking', 'customer', 'venue'],
        });
        return success(review, 'Lấy chi tiết review thành công');
    }

    async findByVenue(venueId: number) {
        const reviews = await this.reviewRepo.find({
            where: { venueId },
            order: { createdAt: 'DESC' },
        });
        return success(reviews, 'Lấy danh sách review theo venue thành công');
    }

    async update(reviewId: number, updateDto: UpdateReviewDto) {
        const result = await this.reviewRepo.update({ reviewId }, updateDto);
        return success(result, 'Cập nhật review thành công');
    }

    async remove(reviewId: number) {
        const result = await this.reviewRepo.delete({ reviewId });
        return success(result, 'Xóa review thành công');
    }
}
