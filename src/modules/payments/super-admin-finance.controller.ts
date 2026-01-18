import { Controller, Get, Post, Body, UseGuards, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/role.constant';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiSuccessResponse, ApiPaginatedResponse } from '../../common/decorators/api-response.decorator';
import { Payment } from './entities/payment.entity';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Super Admin - Finance')
@ApiBearerAuth()
@Roles(UserRole.SUPER_ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('super-admin/finance-ops')
export class SuperAdminFinanceController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Get('transactions')
    @ApiOperation({ summary: 'Danh sách giao dịch tài chính' })
    @ApiPaginatedResponse(Payment)
    async findAll(@Query() filter: any) {
        return this.paymentsService.findAll(filter);
    }

    @Post('payouts')
    @ApiOperation({ summary: 'Xử lý thanh toán cho Owner' })
    @ApiSuccessResponse()
    async processPayout(@Body() data: any) {
        return { success: true };
    }

    @Post('refunds/:id')
    @ApiOperation({ summary: 'Xử lý hoàn tiền' })
    @ApiSuccessResponse()
    async processRefund(@Param('id') id: string, @Body('amount') amount: number) {
        return { success: true };
    }
}
