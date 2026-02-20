import { Controller, Get, Post, Body, UseGuards, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/role.constant';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiSuccessResponse, ApiPaginatedResponse } from '../../common/decorators/api-response.decorator';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Staff - Finance')
@ApiBearerAuth()
@Roles(UserRole.STAFF)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('staff/finance')
export class StaffFinanceController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Get('transactions')
    @ApiOperation({ summary: 'Danh sách giao dịch tài chính' })
    @ApiPaginatedResponse(Object)
    async findAll(@Query() filter: any) {
        return this.paymentsService.findAll(filter);
    }

    @Post('payouts')
    @ApiOperation({ summary: 'Xử lý thanh toán cho Owner' })
    @ApiSuccessResponse()
    async processPayout(@Body() data: any) {
        // Logic thanh toán cho owner
        return { success: true };
    }

    @Post('refunds/:id')
    @ApiOperation({ summary: 'Xử lý hoàn tiền' })
    @ApiSuccessResponse()
    async processRefund(@Param('id') id: string, @Body('amount') amount: number) {
        // Logic refund (giả định processRefund trong service)
        return { success: true };
    }
}
