// src/modules/reviews/review.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  create(@Body() dto: CreateReviewDto) {
    return this.reviewService.create(dto);
  }

  @Get()
  findAll() {
    return this.reviewService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.reviewService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateReviewDto) {
    return this.reviewService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.reviewService.remove(id);
  }

  @Get('field/:fieldId')
  findByField(@Param('fieldId') fieldId: number) {
    return this.reviewService.findByField(fieldId);
  }

  @Get('customer/:customerId')
  findByCustomer(@Param('customerId') customerId: number) {
    return this.reviewService.findByCustomer(customerId);
  }
}
