import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
import { BookingsService } from '../bookings.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/constants/role.constant';
import { ResponseUtil } from '../../../common/utils/response.util';
import { BookingStatus } from '@prisma/client';

@Controller('owner/bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.SUPER_ADMIN, UserRole.VENUE_STAFF)
export class OwnerController {
    constructor(private readonly bookingsService: BookingsService) {}

    @Get(':venueId')
    async getBookings(@Req() req: any, @Param('venueId') venueId: string) {
        const bookings = await this.bookingsService.getOwnerBookings(req.user.id, venueId);
        return ResponseUtil.success(bookings, 'Danh sách lịch đặt sân');
    }

    @Patch(':id/status')
    async updateStatus(@Req() req: any, @Param('id') id: string, @Body() body: { status: BookingStatus }) {
        const booking = await this.bookingsService.ownerUpdateBookingStatus(req.user.id, id, body.status);
        return ResponseUtil.success(booking, 'Cập nhật trạng thái thành công');
    }

    @Get(':venueId/waitlist')
    async getWaitlist(@Req() req: any, @Param('venueId') venueId: string) {
        const waitlist = await this.bookingsService.getOwnerWaitlist(req.user.id, venueId);
        return ResponseUtil.success(waitlist, 'Danh sách khách chờ');
    }

    @Get(':venueId/recurring')
    async getRecurring(@Req() req: any, @Param('venueId') venueId: string) {
        const recurring = await this.bookingsService.getOwnerRecurringBookings(req.user.id, venueId);
        return ResponseUtil.success(recurring, 'Danh sách lịch cố định');
    }
}
