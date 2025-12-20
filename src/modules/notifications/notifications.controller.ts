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
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationFilterDto } from './dto/notification-filter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  // =====================================================
  // CREATE
  // =====================================================
  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create new notification' })
  async create(@Body() dto: CreateNotificationDto) {
    const notification = await this.notificationsService.create(dto);
    return {
      success: true,
      message: 'Notification created successfully',
      data: notification,
    };
  }

  // =====================================================
  // CREATE - Gửi hàng loạt
  // =====================================================
  @Post('bulk')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Send bulk notifications' })
  async sendBulk(@Body() dto: CreateNotificationDto) {
    const notifications = await this.notificationsService.sendBulkNotification(dto);
    return {
      success: true,
      message: 'Bulk notifications sent successfully',
      data: notifications,
      count: notifications.length,
    };
  }

  // =====================================================
  // READ - All
  // =====================================================
  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all notifications' })
  async findAll(@Query() filters: NotificationFilterDto) {
    const notifications = await this.notificationsService.findAll(filters);
    return {
      success: true,
      message: 'Notifications retrieved successfully',
      data: notifications,
      total: notifications.length,
    };
  }

  // =====================================================
  // READ - My notifications
  // =====================================================
  @Get('my-notifications')
  @ApiOperation({ summary: 'Get my notifications' })
  async getMyNotifications(
    @CurrentUser('id') userId: string,
    @Query() filters: NotificationFilterDto,
  ) {
    const notifications = await this.notificationsService.getUserNotifications(
      userId,
      filters,
    );
    return {
      success: true,
      message: 'Your notifications retrieved successfully',
      data: notifications,
      total: notifications.length,
    };
  }

  // =====================================================
  // READ - Unread notifications
  // =====================================================
  @Get('unread')
  @ApiOperation({ summary: 'Get unread notifications' })
  async getUnread(@CurrentUser('id') userId: string) {
    const notifications = await this.notificationsService.getUnreadNotifications(userId);
    const count = await this.notificationsService.countUnreadNotifications(userId);
    return {
      success: true,
      message: 'Unread notifications retrieved successfully',
      data: notifications,
      unreadCount: count,
    };
  }

  // =====================================================
  // READ - Unread count
  // =====================================================
  @Get('unread/count')
  @ApiOperation({ summary: 'Get unread notification count' })
  async getUnreadCount(@CurrentUser('id') userId: string) {
    const count = await this.notificationsService.countUnreadNotifications(userId);
    return {
      success: true,
      message: 'Unread count retrieved successfully',
      data: { unreadCount: count },
    };
  }

  // =====================================================
  // READ - By ID
  // =====================================================
  @Get(':id')
  @ApiOperation({ summary: 'Get notification by ID' })
  async findOne(@Param('id') id: string) {
    const notification = await this.notificationsService.findOne(id);
    return {
      success: true,
      message: 'Notification retrieved successfully',
      data: notification,
    };
  }

  // =====================================================
  // READ - Statistics
  // =====================================================
  @Get('statistics/my-stats')
  @ApiOperation({ summary: 'Get notification statistics' })
  async getStatistics(@CurrentUser('id') userId: string) {
    const stats = await this.notificationsService.getNotificationStatistics(userId);
    return {
      success: true,
      message: 'Statistics retrieved successfully',
      data: stats,
    };
  }

  // =====================================================
  // UPDATE
  // =====================================================
  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update notification' })
  async update(@Param('id') id: string, @Body() dto: UpdateNotificationDto) {
    const notification = await this.notificationsService.update(id, dto);
    return {
      success: true,
      message: 'Notification updated successfully',
      data: notification,
    };
  }

  // =====================================================
  // UPDATE - Mark as read
  // =====================================================
  @Put(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@Param('id') id: string) {
    const notification = await this.notificationsService.markAsRead(id);
    return {
      success: true,
      message: 'Notification marked as read',
      data: notification,
    };
  }

  // =====================================================
  // UPDATE - Mark multiple as read
  // =====================================================
  @Put('read/multiple')
  @ApiOperation({ summary: 'Mark multiple notifications as read' })
  async markMultipleAsRead(@Body() body: { ids: string[] }) {
    await this.notificationsService.markMultipleAsRead(body.ids);
    return {
      success: true,
      message: 'Notifications marked as read',
    };
  }

  // =====================================================
  // UPDATE - Mark all as read
  // =====================================================
  @Put('read/all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@CurrentUser('id') userId: string) {
    await this.notificationsService.markAllAsRead(userId);
    return {
      success: true,
      message: 'All notifications marked as read',
    };
  }

  // =====================================================
  // DELETE
  // =====================================================
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete notification' })
  async remove(@Param('id') id: string) {
    await this.notificationsService.remove(id);
    return {
      success: true,
      message: 'Notification deleted successfully',
    };
  }

  // =====================================================
  // DELETE - Clear user notifications
  // =====================================================
  @Delete('user/all')
  @HttpCode(204)
  @ApiOperation({ summary: 'Clear all notifications' })
  async clearAll(@CurrentUser('id') userId: string) {
    await this.notificationsService.removeByUser(userId);
    return {
      success: true,
      message: 'All notifications cleared',
    };
  }
}