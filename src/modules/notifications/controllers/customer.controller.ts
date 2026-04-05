import { Controller, Get, UseGuards, Query, Post, Body, Param } from '@nestjs/common';
import { NotificationsService } from '../notifications.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { NotificationType, NotificationChannel } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Notifications (Customer)')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class CustomerController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách thông báo của tôi' })
  async getMyNotifications(
    @CurrentUser('id') userId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.notificationsService.getNotifications(userId, limit, offset);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Lấy số lượng thông báo chưa đọc' })
  async getUnreadCount(@CurrentUser('id') userId: string) {
    const count = await this.notificationsService.getUnreadCount(userId);
    return { count };
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Đánh dấu một thông báo là đã đọc' })
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Đánh dấu tất cả thông báo là đã đọc' })
  async markAllAsRead(@CurrentUser('id') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Post('test-realtime')
  @ApiOperation({ summary: 'API Test: Gửi một thông báo Realtime tới tôi ngay lập tức' })
  async testRealtime(@CurrentUser('id') userId: string) {
    const notification = await this.notificationsService.create({
      userId,
      type: NotificationType.SYSTEM,
      channel: NotificationChannel.IN_APP,
      title: 'Thông báo Realtime Test 🚀',
      message: 'Chúc mừng bác! Hệ thống Socket.io đã kết nối và bắn thông báo Realtime thành công rực rỡ nhé! 😂🎉',
    });
    return { success: true, notification };
  }
}
