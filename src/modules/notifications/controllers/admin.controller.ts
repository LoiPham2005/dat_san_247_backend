import { Controller, Get, Post, Body, Query, Param, Delete, UseGuards } from '@nestjs/common';
import { NotificationsService } from '../notifications.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/constants/role.constant';
import { AdminQueryNotificationsDto } from '../dto/query-notifications.dto';
import { AdminSendNotificationDto, SendTarget } from '../dto/admin-send-notification.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Notifications (Admin)')
@ApiBearerAuth()
@Controller('admin/notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class AdminController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả thông báo trong hệ thống (Dành cho Admin)' })
  async findAll(@Query() query: AdminQueryNotificationsDto) {
    return this.notificationsService.getAdminNotifications(query);
  }

  @Post('send')
  @ApiOperation({ summary: 'Gửi thông báo hệ thống tới người dùng/vai trò nhất định' })
  async sendNotification(@Body() dto: AdminSendNotificationDto) {
    if (dto.target === SendTarget.ALL) {
      return this.notificationsService.sendToAll({
        title: dto.title,
        message: dto.message,
        type: dto.type,
      });
    }

    if (dto.target === SendTarget.ROLES && dto.roles) {
      return this.notificationsService.sendToRoles(dto.roles, {
        title: dto.title,
        message: dto.message,
        type: dto.type,
      });
    }

    if (dto.target === SendTarget.USERS && dto.userIds) {
      const results = await Promise.all(
        dto.userIds.map(userId =>
          this.notificationsService.create({
            userId,
            title: dto.title,
            message: dto.message,
            type: dto.type || 'SYSTEM' as any,
            channel: 'IN_APP' as any,
          }),
        ),
      );
      return { count: results.length };
    }

    return { count: 0 };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa một thông báo' })
  async remove(@Param('id') id: string) {
    return this.notificationsService.delete(id);
  }
}
