import { Controller, Post, Body, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiSuccessResponse } from '../../common/decorators/api-response.decorator';

@ApiTags('Client - Reviews')
@ApiBearerAuth()
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) { }

  @Post()
  @ApiOperation({ summary: 'Gửi đánh giá cho một đơn đặt sân' })
  @ApiSuccessResponse()
  async create(@CurrentUser('id') userId: string, @Body() data: any) {
    return this.reviewsService.createReview(userId, data);
  }
}
