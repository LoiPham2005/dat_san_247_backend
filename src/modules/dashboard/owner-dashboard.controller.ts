import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/role.constant';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiSuccessResponse } from '../../common/decorators/api-response.decorator';

@ApiTags('Owner - Dashboard')
@ApiBearerAuth()
@Roles(UserRole.OWNER)
@UseGuards(RolesGuard)
@Controller('owner/dashboard')
export class OwnerDashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('overview')
    @ApiOperation({ summary: 'Lấy tổng quan dashboard cho chủ sân' })
    @ApiSuccessResponse()
    async getOverview(@CurrentUser('id') ownerId: string) {
        return this.dashboardService.getOwnerOverview(ownerId);
    }

    @Get('revenue-chart')
    @ApiOperation({ summary: 'Biểu đồ doanh thu theo sân của chủ' })
    @ApiSuccessResponse()
    async getRevenueChart(@CurrentUser('id') ownerId: string) {
        return this.dashboardService.getOwnerRevenueChart(ownerId);
    }

    @Get('upcoming-bookings')
    @ApiOperation({ summary: 'Danh sách lịch đặt sân sắp tới' })
    @ApiSuccessResponse()
    async getUpcomingBookings(@CurrentUser('id') ownerId: string) {
        return this.dashboardService.getUpcomingBookings(ownerId);
    }
}
