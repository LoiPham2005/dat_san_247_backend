import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  create(@Body() createDto: CreateReviewDto) {
    return this.reviewsService.create(createDto);
  }

  @Get()
  findAll() {
    return this.reviewsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.reviewsService.findOne(id);
  }

  @Get('venue/:venueId')
  findByVenue(@Param('venueId') venueId: number) {
    return this.reviewsService.findByVenue(venueId);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateDto: UpdateReviewDto) {
    return this.reviewsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.reviewsService.remove(id);
  }
}
