import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewReply } from './entities/review-reply.entity';
import { CreateReviewReplyDto } from './dto/create-review-reply.dto';
import { UpdateReviewReplyDto } from './dto/update-review-reply.dto';

@Injectable()
export class ReviewRepliesService {
  constructor(
    @InjectRepository(ReviewReply)
    private readonly replyRepo: Repository<ReviewReply>,
  ) {}

  create(createDto: CreateReviewReplyDto) {
    const reply = this.replyRepo.create(createDto);
    return this.replyRepo.save(reply);
  }

  findAll() {
    return this.replyRepo.find({ relations: ['review', 'user'], order: { createdAt: 'DESC' } });
  }

  findOne(replyId: number) {
    return this.replyRepo.findOne({ where: { replyId }, relations: ['review', 'user'] });
  }

  findByReview(reviewId: number) {
    return this.replyRepo.find({ where: { reviewId }, order: { createdAt: 'DESC' } });
  }

  update(replyId: number, updateDto: UpdateReviewReplyDto) {
    return this.replyRepo.update({ replyId }, updateDto);
  }

  remove(replyId: number) {
    return this.replyRepo.delete({ replyId });
  }
}
