import { Controller, Get, Post, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VenuesService } from './venues.service';
import { VenueFilterDto } from './dto/venue-filter.dto';
import { ApiSuccessResponse, ApiPaginatedResponse } from '../../common/decorators/api-response.decorator';
import { Venue } from './entities/venue.entity';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Client - Venues')
@Controller('venues')
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) { }

  @Get()
  @ApiOperation({ summary: 'Tìm kiếm và lọc sân' })
  @ApiPaginatedResponse(Venue)
  async findAll(@Query() filter: VenueFilterDto) {
    // Chỉ lấy những sân đã được duyệt (APPROVED)
    filter.status = 'APPROVED' as any;
    return this.venuesService.findAll(filter);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Lấy danh sách sân nổi bật (Home)' })
  @ApiSuccessResponse(Venue, true)
  async findFeatured() {
    return this.venuesService.findFeatured();
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Chi tiết sân' })
  @ApiSuccessResponse(Venue)
  async findOne(@Param('id') id: string, @CurrentUser('id') userId?: string) {
    return this.venuesService.findOne(id, userId);
  }

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Lấy đánh giá của sân' })
  @ApiSuccessResponse()
  async getReviews(@Param('id') id: string, @Query() pagination: any) {
    return this.venuesService.getVenueReviews(id, pagination);
  }

  @Post(':id/favorite')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Thêm vào yêu thích' })
  @ApiSuccessResponse()
  async addToFavorite(@CurrentUser('id') userId: string, @Param('id') venueId: string) {
    return this.venuesService.toggleFavorite(userId, venueId, true);
  }

  @Delete(':id/favorite')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Xóa khỏi yêu thích' })
  @ApiSuccessResponse()
  async removeFromFavorite(@CurrentUser('id') userId: string, @Param('id') venueId: string) {
    return this.venuesService.toggleFavorite(userId, venueId, false);
  }

  @Get('my/favorites')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Danh sách sân yêu thích của tôi' })
  @ApiSuccessResponse(Venue, true)
  async getMyFavorites(@CurrentUser('id') userId: string) {
    return this.venuesService.findMyFavorites(userId);
  }
}
