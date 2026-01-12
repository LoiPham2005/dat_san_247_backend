import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/role.constant';
import { RolesGuard } from '../../common/guards/roles.guard';
import { BookingFilterDto } from './dto/booking-filter.dto';
import { ApiSuccessResponse, ApiPaginatedResponse } from '../../common/decorators/api-response.decorator';
import { Booking } from './entities/booking.entity';
import { BookingStatus } from '../../common/constants/booking-status.constant';

@ApiTags('Super Admin - Bookings')
@ApiBearerAuth()
@Roles(UserRole.SUPER_ADMIN)
@UseGuards(RolesGuard)
@Controller('super-admin/bookings')
export class SuperAdminBookingsController {
    constructor(private readonly bookingsService: BookingsService) { }

    @Get()
    @ApiOperation({ summary: 'Danh sách tất cả đơn đặt sân' })
    @ApiPaginatedResponse(Booking)
    async findAll(@Query() filter: BookingFilterDto) {
        return this.bookingsService.findAll(filter);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Chi tiết đơn đặt sân' })
    @ApiSuccessResponse(Booking)
    async findOne(@Param('id') id: string) {
        return this.bookingsService.findOne(id);
    }

    @Post(':id/cancel')
    @ApiOperation({ summary: 'Hủy đơn đặt sân' })
    @ApiSuccessResponse()
    async cancel(@Param('id') id: string, @Body('reason') reason: string) {
        return this.bookingsService.updateStatus(id, BookingStatus.CANCELLED, reason);
    }

    @Post(':id/refund')
    @ApiOperation({ summary: 'Hoàn tiền cho khách' })
    @ApiSuccessResponse()
    async refund(@Param('id') id: string, @Body('amount') amount: number) {
        return this.bookingsService.processRefund(id, amount);
    }
}
