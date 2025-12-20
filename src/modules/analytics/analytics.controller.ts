// modules/analytics/analytics.controller.ts
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('booking-stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.VENUE_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get booking statistics' })
  async getBookingStats(
    @Query() queryDto: AnalyticsQueryDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.analyticsService.getBookingStats(queryDto, userId);
  }

  @Get('revenue-by-period')
  @UseGuards(RolesGuard)
  @Roles(UserRole.VENUE_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get revenue by period' })
  async getRevenueByPeriod(@Query() queryDto: AnalyticsQueryDto) {
    return this.analyticsService.getRevenueByPeriod(queryDto);
  }

  @Get('top-venues')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get top performing venues' })
  async getTopVenues(@Query('limit') limit?: number) {
    return this.analyticsService.getTopVenues(limit);
  }

  @Get('venue-performance/:venueId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.VENUE_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get venue performance metrics' })
  async getVenuePerformance(
    @Param('venueId') venueId: string,
    @Query() queryDto: AnalyticsQueryDto,
  ) {
    return this.analyticsService.getVenuePerformance(venueId, queryDto);
  }

  @Get('owner-dashboard')
  @UseGuards(RolesGuard)
  @Roles(UserRole.VENUE_OWNER)
  @ApiOperation({ summary: 'Get owner dashboard data' })
  async getOwnerDashboard(@CurrentUser('id') ownerId: string) {
    return this.analyticsService.getOwnerDashboard(ownerId);
  }

  @Get('admin-dashboard')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get admin dashboard data' })
  async getAdminDashboard() {
    return this.analyticsService.getAdminDashboard();
  }
}