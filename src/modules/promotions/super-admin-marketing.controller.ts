import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PromotionsService } from '../promotions/promotions.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/role.constant';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiSuccessResponse } from '../../common/decorators/api-response.decorator';
import { PromotionStatus } from '../../common/constants/promotion-status.constant';

@ApiTags('Super Admin - Marketing')
@ApiBearerAuth()
@Roles(UserRole.SUPER_ADMIN)
@UseGuards(RolesGuard)
@Controller('super-admin/marketing')
export class SuperAdminMarketingController {
    constructor(
        private readonly promotionsService: PromotionsService,
        private readonly notificationsService: NotificationsService,
    ) { }

    @Get('dashboard')
    @ApiOperation({ summary: 'Marketing Dashboard' })
    @ApiSuccessResponse()
    async getDashboard() {
        return {
            activePromotions: await this.promotionsService.findAll({ status: PromotionStatus.ACTIVE } as any),
        };
    }

    @Post('notifications/broadcast')
    @ApiOperation({ summary: 'Gửi push notification/email campaign' })
    @ApiSuccessResponse()
    async broadcast(@Body() data: any) {
        return this.notificationsService.broadcast(data);
    }

    @Post('vouchers')
    @ApiOperation({ summary: 'Tạo voucher hệ thống' })
    @ApiSuccessResponse()
    async createVoucher(@Body() data: any) {
        return this.promotionsService.create(data);
    }
}
