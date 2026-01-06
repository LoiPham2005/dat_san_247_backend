import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/role.constant';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiSuccessResponse } from '../../common/decorators/api-response.decorator';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Giả sử đã có JwtAuthGuard

@ApiTags('Admin - Dashboard')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@UseGuards(RolesGuard) // Thêm JwtAuthGuard vào đây khi đã implement hoàn chỉnh
@Controller('admin/dashboard')
export class AdminDashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('overview')
    @ApiOperation({ summary: 'Lấy thông tin tổng quan dashboard admin' })
    @ApiSuccessResponse()
    async getOverview() {
        return this.dashboardService.getAdminOverview();
    }

    @Get('revenue-chart')
    @ApiOperation({ summary: 'Lấy dữ liệu biểu đồ doanh thu' })
    @ApiSuccessResponse()
    async getRevenueChart() {
        return this.dashboardService.getRevenueChartData();
    }

    @Get('top-venues')
    @ApiOperation({ summary: 'Top 10 sân doanh thu cao nhất' })
    @ApiSuccessResponse()
    async getTopVenues() {
        return this.dashboardService.getTopVenues();
    }

    @Get('top-customers')
    @ApiOperation({ summary: 'Top 10 khách hàng VIP' })
    @ApiSuccessResponse()
    async getTopCustomers() {
        return this.dashboardService.getTopCustomers();
    }

    @Get('recent-activities')
    @ApiOperation({ summary: 'Hoạt động gần đây' })
    @ApiSuccessResponse()
    async getRecentActivities() {
        return this.dashboardService.getRecentActivities();
    }
}
