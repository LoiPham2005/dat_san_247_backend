import { Controller, Get, Put, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiSuccessResponse } from '../../common/decorators/api-response.decorator';
import { Notification } from './entities/notification.entity';

@ApiTags('Client - Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @Get()
  @ApiOperation({ summary: 'Danh sách thông báo của tôi' })
  @ApiSuccessResponse(Notification, true)
  async getMyNotifications(@CurrentUser('id') userId: string) {
    return this.notificationsService.findByUser(userId);
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Đánh dấu đã đọc' })
  @ApiSuccessResponse()
  async markAsRead(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.notificationsService.markAsRead(userId, id);
  }
}
