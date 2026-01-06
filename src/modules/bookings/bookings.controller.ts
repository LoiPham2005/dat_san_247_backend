import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BookingFilterDto } from './dto/booking-filter.dto';
import { ApiSuccessResponse, ApiPaginatedResponse } from '../../common/decorators/api-response.decorator';
import { Booking } from './entities/booking.entity';
import { BookingStatus } from '../../common/constants/booking-status.constant';

@ApiTags('Client - Bookings')
@ApiBearerAuth()
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) { }

  @Get('my')
  @ApiOperation({ summary: 'Lấy danh sách đặt sân của tôi' })
  @ApiPaginatedResponse(Booking)
  async getMyBookings(@CurrentUser('id') userId: string, @Query() filter: BookingFilterDto) {
    return this.bookingsService.findAllByUser(userId, filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết đơn đặt sân' })
  @ApiSuccessResponse(Booking)
  async findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.bookingsService.findOneByUser(userId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo đơn đặt sân mới' })
  @ApiSuccessResponse(Booking)
  async create(@CurrentUser('id') userId: string, @Body() data: any) {
    return this.bookingsService.createBooking(userId, data);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Hủy đặt sân' })
  @ApiSuccessResponse()
  async cancel(@CurrentUser('id') userId: string, @Param('id') id: string, @Body('reason') reason: string) {
    return this.bookingsService.cancelByUser(userId, id, reason);
  }
}
