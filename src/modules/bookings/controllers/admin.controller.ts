import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { BookingsService } from '../bookings.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { UserRole } from '../../../common/constants/role.constant';
import { BookingStatus } from '@prisma/client';
import { ResponseUtil } from '../../../common/utils/response.util';
import { QueryBookingsDto } from '../dto/query-bookings.dto';

@Controller('admin/bookings')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminController {
    constructor(private readonly bookingsService: BookingsService) {}

    @Get()
    @Permissions('bookings:read')
    async getAllBookings(@Query() query: QueryBookingsDto) {
        const { items, total } = await this.bookingsService.getAdminBookings(query);
        return ResponseUtil.paginated(
            items,
            total,
            query.page || 1,
            query.limit || 10,
            'Lấy danh sách đơn hàng thành công'
        );
    }

    @Patch(':id/status')
    @Permissions('bookings:manage')
    async updateStatus(
        @Param('id') id: string,
        @Body('status') status: BookingStatus
    ) {
        return this.bookingsService.adminUpdateBookingStatus(id, status);
    }
}
