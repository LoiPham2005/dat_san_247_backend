import { Controller, Get, Patch, Param, Body, UseGuards, Query } from '@nestjs/common';
import { BookingsService } from '../bookings.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/constants/role.constant';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { BookingStatus } from '@prisma/client';

@Controller('bookings/venue-staff')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VenueStaffController {
    constructor(private readonly bookingsService: BookingsService) { }

    @Get('schedule')
    @Roles(UserRole.VENUE_STAFF, UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async getSchedule(
        @CurrentUser('id') userId: string,
        @Query('venue_id') venueId: string
    ) {
        return this.bookingsService.getVenueStaffSchedule(userId, venueId);
    }

    @Patch(':id/status')
    @Roles(UserRole.VENUE_STAFF, UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async updateStatus(
        @CurrentUser('id') userId: string,
        @Param('id') bookingId: string,
        @Body('status') status: BookingStatus
    ) {
        return this.bookingsService.venueStaffUpdateStatus(userId, bookingId, status);
    }
}
