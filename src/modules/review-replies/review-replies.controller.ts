import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ReviewRepliesService } from './review-replies.service';
import { CreateReviewReplyDto } from './dto/create-review-reply.dto';
import { UpdateReviewReplyDto } from './dto/update-review-reply.dto';

@Controller('review-replies')
export class ReviewRepliesController {
  constructor(private readonly reviewRepliesService: ReviewRepliesService) {}

  @Post()
  create(@Body() createDto: CreateReviewReplyDto) {
    return this.reviewRepliesService.create(createDto);
  }

  @Get()
  findAll() {
    return this.reviewRepliesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.reviewRepliesService.findOne(id);
  }

  @Get('review/:reviewId')
  findByReview(@Param('reviewId') reviewId: number) {
    return this.reviewRepliesService.findByReview(reviewId);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateDto: UpdateReviewReplyDto) {
    return this.reviewRepliesService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.reviewRepliesService.remove(id);
  }
}
