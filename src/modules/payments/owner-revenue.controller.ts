import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/role.constant';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaymentFilterDto } from './dto/payment-filter.dto';
import { ApiSuccessResponse, ApiPaginatedResponse } from '../../common/decorators/api-response.decorator';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Owner - Revenue')
@ApiBearerAuth()
@Roles(UserRole.OWNER)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('owner/revenue')
export class OwnerRevenueController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Get('overview')
    @ApiOperation({ summary: 'Tổng quan doanh thu của chủ sân' })
    @ApiSuccessResponse()
    async getOverview(@CurrentUser('id') ownerId: string) {
        return this.paymentsService.getOwnerRevenueStats(ownerId);
    }

    @Get('history')
    @ApiOperation({ summary: 'Lịch sử giao dịch tiền về của chủ sân' })
    @ApiPaginatedResponse(Object)
    async getHistory(@CurrentUser('id') ownerId: string, @Query() filter: PaymentFilterDto) {
        return this.paymentsService.findAllByOwner(ownerId, filter);
    }
}
