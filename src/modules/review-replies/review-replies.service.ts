import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewReply } from './entities/review-reply.entity';
import { CreateReviewReplyDto } from './dto/create-review-reply.dto';
import { UpdateReviewReplyDto } from './dto/update-review-reply.dto';
import { success } from 'src/common/helper/response.helper';

@Injectable()
export class ReviewRepliesService {
    constructor(
        @InjectRepository(ReviewReply)
        private readonly replyRepo: Repository<ReviewReply>,
    ) { }

    async create(createDto: CreateReviewReplyDto) {
        const reply = this.replyRepo.create(createDto);
        const saved = await this.replyRepo.save(reply);
        return success(saved, 'Tạo reply thành công');
    }

    async findAll() {
        const replies = await this.replyRepo.find({ relations: ['review', 'user'], order: { createdAt: 'DESC' } });
        return success(replies, 'Lấy danh sách reply thành công');
    }

    async findOne(replyId: number) {
        const reply = await this.replyRepo.findOne({ where: { replyId }, relations: ['review', 'user'] });
        return success(reply, 'Lấy chi tiết reply thành công');
    }

    async findByReview(reviewId: number) {
        const replies = await this.replyRepo.find({ where: { reviewId }, order: { createdAt: 'DESC' } });
        return success(replies, 'Lấy danh sách reply theo review thành công');
    }

    async update(replyId: number, updateDto: UpdateReviewReplyDto) {
        const result = await this.replyRepo.update({ replyId }, updateDto);
        return success(result, 'Cập nhật reply thành công');
    }

    async remove(replyId: number) {
        const result = await this.replyRepo.delete({ replyId });
        return success(result, 'Xóa reply thành công');
    }
}
