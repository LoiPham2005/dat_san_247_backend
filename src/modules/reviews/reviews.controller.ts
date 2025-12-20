// modules/reviews/reviews.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto, OwnerResponseDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Get('venue/:venueId')
  @Public()
  @ApiOperation({ summary: 'Get reviews by venue' })
  async getByVenue(
    @Param('venueId') venueId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.reviewsService.findByVenue(venueId, paginationDto);
  }

  @Get('my-reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my reviews' })
  async getMyReviews(@CurrentUser('id') userId: string) {
    return this.reviewsService.findByUser(userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create review' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewsService.create(userId, createReviewDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update review' })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(id, userId, updateReviewDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete review' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.reviewsService.delete(id, userId);
    return { message: 'Review deleted successfully' };
  }

  @Post(':id/response')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENUE_OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add owner response to review' })
  async addOwnerResponse(
    @Param('id') reviewId: string,
    @CurrentUser('id') ownerId: string,
    @Body() responseDto: OwnerResponseDto,
  ) {
    return this.reviewsService.addOwnerResponse(reviewId, ownerId, responseDto);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Like a review' })
  async like(
    @Param('id') reviewId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.reviewsService.likeReview(reviewId, userId);
    return { message: 'Review liked' };
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve review (Admin/Staff only)' })
  async approve(@Param('id') reviewId: string) {
    return this.reviewsService.approveReview(reviewId);
  }
}