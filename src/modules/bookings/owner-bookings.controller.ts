import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/role.constant';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BookingFilterDto } from './dto/booking-filter.dto';
import { ApiSuccessResponse, ApiPaginatedResponse } from '../../common/decorators/api-response.decorator';

import { BookingStatus } from '../../common/constants/booking-status.constant';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Owner - Bookings')
@ApiBearerAuth()
@Roles(UserRole.OWNER)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('owner/bookings')
export class OwnerBookingsController {
    constructor(private readonly bookingsService: BookingsService) { }

    @Get()
    @ApiOperation({ summary: 'Danh sách booking của chủ sân' })
    @ApiPaginatedResponse(Object)
    async findAll(@CurrentUser('id') ownerId: string, @Query() filter: BookingFilterDto) {
        return this.bookingsService.findAllByOwner(ownerId, filter);
    }

    @Post()
    @ApiOperation({ summary: 'Tạo booking trực tiếp (Walk-in)' })
    @ApiSuccessResponse()
    async createWalkIn(@CurrentUser('id') ownerId: string, @Body() data: any) {
        return this.bookingsService.createWalkIn(ownerId, data);
    }

    @Post(':id/confirm')
    @ApiOperation({ summary: 'Xác nhận booking' })
    @ApiSuccessResponse()
    async confirm(@CurrentUser('id') ownerId: string, @Param('id') id: string) {
        return this.bookingsService.updateStatusByOwner(ownerId, id, BookingStatus.CONFIRMED);
    }

    @Post(':id/check-in')
    @ApiOperation({ summary: 'Check-in khách' })
    @ApiSuccessResponse()
    async checkIn(@CurrentUser('id') ownerId: string, @Param('id') id: string) {
        return this.bookingsService.updateStatusByOwner(ownerId, id, BookingStatus.CHECKED_IN);
    }

    @Post(':id/complete')
    @ApiOperation({ summary: 'Hoàn thành booking' })
    @ApiSuccessResponse()
    async complete(@CurrentUser('id') ownerId: string, @Param('id') id: string) {
        return this.bookingsService.updateStatusByOwner(ownerId, id, BookingStatus.COMPLETED);
    }

    @Post(':id/cancel')
    @ApiOperation({ summary: 'Hủy booking' })
    @ApiSuccessResponse()
    async cancel(@CurrentUser('id') ownerId: string, @Param('id') id: string, @Body('reason') reason: string) {
        return this.bookingsService.updateStatusByOwner(ownerId, id, BookingStatus.CANCELLED, reason);
    }
}
