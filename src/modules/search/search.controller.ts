import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { CreateSearchHistoryDto } from './dto/create-search-history.dto';
import { SearchFilterDto } from './dto/search-filter.dto';
import { SearchVenueDto } from './dto/search-venue.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  // =====================================================
  // PUBLIC - Tìm kiếm sân
  // =====================================================
  @Get('venues')
  @Public()
  @ApiOperation({ summary: 'Search venues' })
  async searchVenues(@Query() searchDto: SearchVenueDto) {
    const result = await this.searchService.searchVenues(searchDto);
    return {
      success: true,
      message: 'Venues searched successfully',
      data: result.data,
      meta: result.meta,
    };
  }

  // =====================================================
  // PUBLIC - Tìm kiếm sân bóng
  // =====================================================
  @Get('courts')
  @Public()
  @ApiOperation({ summary: 'Search courts' })
  async searchCourts(@Query() searchDto: SearchVenueDto) {
    const result = await this.searchService.searchCourts(searchDto);
    return {
      success: true,
      message: 'Courts searched successfully',
      data: result.data,
      meta: result.meta,
    };
  }

  // =====================================================
  // PUBLIC - Tìm kiếm nâng cao
  // =====================================================
  @Get('advanced')
  @Public()
  @ApiOperation({ summary: 'Advanced search' })
  async advancedSearch(@Query() searchDto: SearchVenueDto) {
    const result = await this.searchService.advancedSearch(searchDto);
    return {
      success: true,
      message: 'Advanced search completed',
      data: result,
    };
  }

  // =====================================================
  // PUBLIC - Gợi ý tìm kiếm
  // =====================================================
  @Get('suggestions')
  @Public()
  @ApiOperation({ summary: 'Get search suggestions' })
  async getSearchSuggestions(
    @Query('query') query: string,
    @Query('limit') limit?: string,
  ) {
    const suggestions = await this.searchService.getSearchSuggestions(
      query,
      limit ? parseInt(limit) : 10
    );
    return {
      success: true,
      message: 'Suggestions retrieved successfully',
      data: suggestions,
    };
  }

  // =====================================================
  // PUBLIC - Tìm kiếm phổ biến
  // =====================================================
  @Get('trending')
  @Public()
  @ApiOperation({ summary: 'Get trending searches' })
  async getTrendingSearches(@Query('limit') limit?: string) {
    const trending = await this.searchService.getTrendingSearches(
      limit ? parseInt(limit) : 10
    );
    return {
      success: true,
      message: 'Trending searches retrieved successfully',
      data: trending,
    };
  }

  // =====================================================
  // PUBLIC - Gợi ý địa điểm
  // =====================================================
  @Get('locations')
  @Public()
  @ApiOperation({ summary: 'Get location suggestions' })
  async getLocationSuggestions(@Query('query') query: string) {
    const locations = await this.searchService.getLocationSuggestions(query);
    return {
      success: true,
      message: 'Location suggestions retrieved successfully',
      data: locations,
    };
  }

  // =====================================================
  // PUBLIC - Gợi ý loại thể thao
  // =====================================================
  @Get('sport-types')
  @Public()
  @ApiOperation({ summary: 'Get sport type suggestions' })
  async getSportTypeSuggestions() {
    const sportTypes = await this.searchService.getSportTypeSuggestions();
    return {
      success: true,
      message: 'Sport types retrieved successfully',
      data: sportTypes,
    };
  }

  // =====================================================
  // AUTH - Ghi nhận tìm kiếm
  // =====================================================
  @Post('record')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Record search' })
  async recordSearch(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSearchHistoryDto,
  ) {
    const search = await this.searchService.recordSearch(
      { ...dto, userId },
      dto.resultCount || 0
    );
    return {
      success: true,
      message: 'Search recorded successfully',
      data: search,
    };
  }

  // =====================================================
  // AUTH - Lịch sử tìm kiếm của user
  // =====================================================
  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get my search history' })
  async getMySearchHistory(
    @CurrentUser('id') userId: string,
    @Query('limit') limit?: string,
  ) {
    const history = await this.searchService.getUserSearchHistory(
      userId,
      limit ? parseInt(limit) : 20
    );
    return {
      success: true,
      message: 'Search history retrieved successfully',
      data: history,
      total: history.length,
    };
  }

  // =====================================================
  // AUTH - Xóa lịch sử tìm kiếm
  // =====================================================
  @Delete('history/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete search history' })
  async deleteSearchHistory(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.searchService.deleteSearchHistory(id);
    return {
      success: true,
      message: 'Search history deleted successfully',
    };
  }

  // =====================================================
  // AUTH - Xóa tất cả lịch sử tìm kiếm
  // =====================================================
  @Delete('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(204)
  @ApiOperation({ summary: 'Clear all search history' })
  async clearSearchHistory(@CurrentUser('id') userId: string) {
    await this.searchService.clearUserSearchHistory(userId);
    return {
      success: true,
      message: 'All search history cleared successfully',
    };
  }

  // =====================================================
  // ADMIN - Lấy tất cả lịch sử tìm kiếm
  // =====================================================
  @Get('admin/history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all search history (Admin)' })
  async getAllSearchHistory(@Query() filters: SearchFilterDto) {
    const history = await this.searchService.findAll(filters);
    return {
      success: true,
      message: 'Search history retrieved successfully',
      data: history,
      total: history.length,
    };
  }

  // =====================================================
  // ADMIN - Thống kê tìm kiếm
  // =====================================================
  @Get('admin/statistics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get search statistics' })
  async getSearchStatistics() {
    const stats = await this.searchService.getSearchStatistics();
    return {
      success: true,
      message: 'Search statistics retrieved successfully',
      data: stats,
    };
  }

  // =====================================================
  // ADMIN - Xóa lịch sử cũ
  // =====================================================
  @Post('admin/cleanup')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Clear old search history' })
  async clearOldSearchHistory(@Body() body: { daysOld: number }) {
    await this.searchService.clearOldSearchHistory(body.daysOld);
    return {
      success: true,
      message: 'Old search history cleared successfully',
    };
  }
}