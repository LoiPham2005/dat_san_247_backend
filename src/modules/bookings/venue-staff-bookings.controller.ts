import { Controller, Get, Post, Body, Param, Query, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { VenuesService } from '../venues/venues.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/role.constant';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiSuccessResponse, ApiPaginatedResponse } from '../../common/decorators/api-response.decorator';
import { Booking } from './entities/booking.entity';
import { BookingStatus } from '../../common/constants/booking-status.constant';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Staff - Venue Bookings')
@ApiBearerAuth()
@Roles(UserRole.VENUE_STAFF)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('venue-staff/bookings')
export class VenueStaffBookingsController {
    constructor(
        private readonly bookingsService: BookingsService,
        private readonly venuesService: VenuesService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Danh sách booking của sân được gán' })
    @ApiPaginatedResponse(Booking)
    async findAll(@CurrentUser('id') staffId: string, @Query() filter: any) {
        const venueIds = await this.venuesService.getAssignedVenueIds(staffId);
        if (venueIds.length === 0) return { items: [], meta: { total: 0 } };
        return this.bookingsService.findAllForVenues(venueIds, filter);
    }

    @Post(':id/check-in')
    @ApiOperation({ summary: 'Check-in khách' })
    @ApiSuccessResponse()
    async checkIn(@CurrentUser('id') staffId: string, @Param('id') id: string) {
        await this.checkPermission(staffId, id);
        return this.bookingsService.updateStatus(id, BookingStatus.CHECKED_IN);
    }

    @Post(':id/check-out')
    @ApiOperation({ summary: 'Check-out (Hoàn thành)' })
    @ApiSuccessResponse()
    async checkOut(@CurrentUser('id') staffId: string, @Param('id') id: string, @Body() data: any) {
        await this.checkPermission(staffId, id);
        // Lưu báo cáo hư hỏng nếu có trong data
        return this.bookingsService.updateStatus(id, BookingStatus.COMPLETED);
    }

    @Post('walk-in')
    @ApiOperation({ summary: 'Tạo booking trực tiếp (Walk-in)' })
    @ApiSuccessResponse()
    async createWalkIn(@CurrentUser('id') staffId: string, @Body() data: any) {
        const venueIds = await this.venuesService.getAssignedVenueIds(staffId);
        if (!venueIds.includes(data.venueId)) {
            throw new UnauthorizedException('You are not assigned to this venue');
        }
        return this.bookingsService.createBooking(staffId, { ...data, status: BookingStatus.CONFIRMED });
    }

    private async checkPermission(staffId: string, bookingId: string) {
        const booking = await this.bookingsService.findOne(bookingId);
        const venueIds = await this.venuesService.getAssignedVenueIds(staffId);
        if (!venueIds.includes(booking.venueId)) {
            throw new UnauthorizedException('You do not have permission for this booking');
        }
    }
}
