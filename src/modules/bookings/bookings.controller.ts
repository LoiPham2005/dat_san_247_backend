import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BookingFilterDto } from './dto/booking-filter.dto';
import { ApiSuccessResponse, ApiPaginatedResponse } from '../../common/decorators/api-response.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Client - Bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) { }

  @Get('my')
  @ApiOperation({ summary: 'Lấy danh sách đặt sân của tôi' })
  @ApiPaginatedResponse(Object)
  async getMyBookings(@CurrentUser('id') userId: string, @Query() filter: BookingFilterDto) {
    return this.bookingsService.findAllByUser(userId, filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết đơn đặt sân' })
  @ApiSuccessResponse(Object)
  async findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.bookingsService.findOneByUser(userId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo đơn đặt sân mới' })
  @ApiSuccessResponse(Object)
  async create(@CurrentUser('id') userId: string, @Body() data: any) {
    return this.bookingsService.createBooking(userId, data);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Hủy đặt sân' })
  @ApiSuccessResponse()
  async cancel(@CurrentUser('id') userId: string, @Param('id') id: string, @Body('reason') reason: string) {
    return this.bookingsService.cancelByUser(userId, id, reason);
  }

  @Post(':id/reschedule')
  @ApiOperation({ summary: 'Đổi lịch đặt sân' })
  @ApiSuccessResponse(Object)
  async reschedule(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() data: any) {
    return this.bookingsService.rescheduleBooking(userId, id, data);
  }

  @Post(':id/invoice-request')
  @ApiOperation({ summary: 'Yêu cầu hóa đơn' })
  @ApiSuccessResponse()
  async requestInvoice(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() data: any) {
    return this.bookingsService.requestInvoice(userId, id, data);
  }
}
