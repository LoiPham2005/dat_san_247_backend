import { Controller, Get, UseGuards } from '@nestjs/common';
import { BookingsService } from '../bookings.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/constants/role.constant';
import { ResponseUtil } from '../../../common/utils/response.util';

@Controller('admin/bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminController {
    constructor(private readonly bookingsService: BookingsService) {}

    @Get()
    async getAllBookings() {
        // Simple placeholder for all platform bookings
        // In reality, this should have pagination and search
        return ResponseUtil.success([], 'Tất cả lịch đặt trên hệ thống');
    }
}
