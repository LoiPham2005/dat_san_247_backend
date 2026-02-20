import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/role.constant';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PaymentFilterDto } from './dto/payment-filter.dto';
import { ApiSuccessResponse, ApiPaginatedResponse } from '../../common/decorators/api-response.decorator';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Admin - Finance')
@ApiBearerAuth()
@Roles(UserRole.SUPER_ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/finance')
export class AdminPaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Get('transactions')
    @ApiOperation({ summary: 'Danh sách tất cả giao dịch' })
    @ApiPaginatedResponse(Object)
    async findAll(@Query() filter: PaymentFilterDto) {
        return this.paymentsService.findAll(filter);
    }

    @Get('stats')
    @ApiOperation({ summary: 'Thống kê tài chính nâng cao' })
    @ApiSuccessResponse()
    async getStats() {
        return this.paymentsService.getFinancialStats();
    }
}
