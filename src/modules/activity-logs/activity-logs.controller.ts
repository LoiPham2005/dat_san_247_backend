import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ActivityLogsService } from './activity-logs.service';
import { ActivityLogFilterDto } from './dto/activity-log-filter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Activity Logs')
@Controller('activity-logs')
export class ActivityLogsController {
  constructor(private activityLogsService: ActivityLogsService) { }

  // =====================================================
  // ADMIN - Lấy tất cả activity logs
  // =====================================================
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all activity logs' })
  async findAll(
    @Query() filters: ActivityLogFilterDto,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
  ) {
    const result = await this.activityLogsService.findAll(
      filters,
      parseInt(page),
      parseInt(limit),
    );
    return {
      success: true,
      message: 'Activity logs retrieved successfully',
      data: result.data,
      meta: result.meta,
    };
  }

  // =====================================================
  // ADMIN - Lấy activity log theo ID
  // =====================================================
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get activity log by ID' })
  async findOne(@Param('id') id: string) {
    const log = await this.activityLogsService.findOne(id);
    return {
      success: true,
      message: 'Activity log retrieved successfully',
      data: log,
    };
  }

  // =====================================================
  // USER - Lấy activity logs của mình
  // =====================================================
  @Get('my-activity')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get my activity logs' })
  async getMyActivity(
    @CurrentUser('id') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
  ) {
    const result = await this.activityLogsService.findByUser(
      userId,
      parseInt(page),
      parseInt(limit),
    );
    return {
      success: true,
      message: 'Your activity logs retrieved successfully',
      data: result.data,
      meta: result.meta,
    };
  }

  // =====================================================
  // ADMIN - Lấy activity logs của user
  // =====================================================
  @Get('user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get activity logs by user' })
  async findByUser(
    @Param('userId') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
  ) {
    const result = await this.activityLogsService.findByUser(
      userId,
      parseInt(page),
      parseInt(limit),
    );
    return {
      success: true,
      message: 'User activity logs retrieved successfully',
      data: result.data,
      meta: result.meta,
    };
  }

  // =====================================================
  // ADMIN - Lấy activity logs theo entity
  // =====================================================
  @Get('entity/:entityType/:entityId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get activity logs by entity' })
  async findByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
  ) {
    const result = await this.activityLogsService.findByEntity(
      entityType,
      entityId,
      parseInt(page),
      parseInt(limit),
    );
    return {
      success: true,
      message: 'Entity activity logs retrieved successfully',
      data: result.data,
      meta: result.meta,
    };
  }

  // =====================================================
  // ADMIN - Lấy activity logs theo action
  // =====================================================
  @Get('action/:action')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get activity logs by action' })
  async findByAction(
    @Param('action') action: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
  ) {
    const result = await this.activityLogsService.findByAction(
      action,
      parseInt(page),
      parseInt(limit),
    );
    return {
      success: true,
      message: 'Activity logs retrieved successfully',
      data: result.data,
      meta: result.meta,
    };
  }

  // =====================================================
  // ADMIN - Lấy activity logs theo device
  // =====================================================
  @Get('device/:deviceType')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get activity logs by device' })
  async findByDevice(
    @Param('deviceType') deviceType: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
  ) {
    const result = await this.activityLogsService.findByDevice(
      deviceType as any,
      parseInt(page),
      parseInt(limit),
    );
    return {
      success: true,
      message: 'Activity logs retrieved successfully',
      data: result.data,
      meta: result.meta,
    };
  }

  // =====================================================
  // ADMIN - Thống kê hoạt động
  // =====================================================
  @Get('statistics/overview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get activity statistics' })
  async getStatistics(@Query() filters: ActivityLogFilterDto) {
    const stats = await this.activityLogsService.getStatistics(filters);
    return {
      success: true,
      message: 'Statistics retrieved successfully',
      data: stats,
    };
  }

  // =====================================================
  // ADMIN - Hoạt động hàng ngày
  // =====================================================
  @Get('analytics/daily')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get daily activity' })
  async getDailyActivity(@Query('days') days: string = '30') {
    const activity = await this.activityLogsService.getDailyActivity(parseInt(days));
    return {
      success: true,
      message: 'Daily activity retrieved successfully',
      data: activity,
    };
  }

  // =====================================================
  // ADMIN - Hoạt động theo giờ
  // =====================================================
  @Get('analytics/hourly')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get hourly activity' })
  async getHourlyActivity(@Query('date') date: string) {
    const activity = await this.activityLogsService.getHourlyActivity(date);
    return {
      success: true,
      message: 'Hourly activity retrieved successfully',
      data: activity,
    };
  }

  // =====================================================
  // ADMIN - Active users
  // =====================================================
  @Get('analytics/active-users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get active users' })
  async getActiveUsers(@Query('days') days: string = '7') {
    const stats = await this.activityLogsService.getActiveUsers(parseInt(days));
    return {
      success: true,
      message: 'Active users retrieved successfully',
      data: stats,
    };
  }

  // =====================================================
  // USER - Activity timeline
  // =====================================================
  @Get('timeline/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get user activity timeline' })
  async getUserTimeline(
    @Param('userId') userId: string,
    @Query('days') days: string = '30',
  ) {
    const timeline = await this.activityLogsService.getUserActivityTimeline(
      userId,
      parseInt(days),
    );
    return {
      success: true,
      message: 'User activity timeline retrieved successfully',
      data: timeline,
    };
  }

  // =====================================================
  // ADMIN - Export logs
  // =====================================================
  @Post('export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Export activity logs' })
  async exportLogs(@Query() filters: ActivityLogFilterDto) {
    const logs = await this.activityLogsService.exportLogs(filters);
    return {
      success: true,
      message: 'Activity logs exported successfully',
      data: logs,
    };
  }

  // =====================================================
  // ADMIN - Xóa activity log
  // =====================================================
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete activity log' })
  async remove(@Param('id') id: string) {
    await this.activityLogsService.remove(id);
    return {
      success: true,
      message: 'Activity log deleted successfully',
    };
  }

  // =====================================================
  // ADMIN - Xóa activity logs cũ
  // =====================================================
  @Post('cleanup/old-logs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete old activity logs' })
  async removeOldLogs(@Query('daysOld') daysOld: string = '90') {
    await this.activityLogsService.removeOldLogs(parseInt(daysOld));
    return {
      success: true,
      message: 'Old activity logs deleted successfully',
    };
  }
}