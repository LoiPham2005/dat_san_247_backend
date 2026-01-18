import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/role.constant';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiSuccessResponse } from '../../common/decorators/api-response.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Admin - Notifications')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/notifications    ')
export class AdminNotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Post('broadcast')
    @ApiOperation({ summary: 'Gửi thông báo hệ thống cho tất cả user' })
    @ApiSuccessResponse()
    async broadcast(@Body() data: any) {
        return this.notificationsService.broadcast(data);
    }

    @Post('send-to-user')
    @ApiOperation({ summary: 'Gửi thông báo cho user cụ thể' })
    @ApiSuccessResponse()
    async sendToUser(@Body() data: any) {
        return this.notificationsService.sendToUser(data);
    }
}
