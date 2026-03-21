import { Controller, Get, Post, Body, Param, UseGuards, Req, Delete } from '@nestjs/common';
import { BookingsService } from '../bookings.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { CreateRecurringDto } from '../dto/create-recurring.dto';
import { ResponseUtil } from '../../../common/utils/response.util';

@Controller('customer/bookings')
@UseGuards(JwtAuthGuard)
export class CustomerController {
    constructor(private readonly bookingsService: BookingsService) {}

    @Post('recurring')
    async createRecurring(@Req() req: any, @Body() data: CreateRecurringDto) {
        const result = await this.bookingsService.createRecurringBooking(req.user.id, data);
        return ResponseUtil.success(result, 'Gửi yêu cầu đặt sân cố định thành công! Chủ sân sẽ duyệt sớm.');
    }

    @Post()
    async createBooking(@Req() req: any, @Body() data: CreateBookingDto) {
        const result = await this.bookingsService.createBooking(req.user.id, data);
        return ResponseUtil.success(result, 'Đặt sân thành công');
    }

    @Get()
    async getMyBookings(@Req() req: any) {
        const result = await this.bookingsService.getMyBookings(req.user.id);
        return ResponseUtil.success(result, 'Lấy danh sách đặt sân thành công');
    }

    @Get('waitlists')
    async getMyWaitlists(@Req() req: any) {
        const result = await this.bookingsService.getMyWaitlists(req.user.id);
        return ResponseUtil.success(result, 'Lấy danh sách chờ thành công');
    }

    @Get('recurring')
    async getMyRecurringBookings(@Req() req: any) {
        const result = await this.bookingsService.getMyRecurringBookings(req.user.id);
        return ResponseUtil.success(result, 'Lấy danh sách đặt sân cố định thành công');
    }

    @Get(':id')
    async getBookingDetail(@Req() req: any, @Param('id') id: string) {
        const result = await this.bookingsService.getBookingDetail(req.user.id, id);
        return ResponseUtil.success(result, 'Lấy chi tiết đặt sân thành công');
    }

    @Delete(':id')
    async cancelBooking(@Req() req: any, @Param('id') id: string, @Body('reason') reason: string) {
        await this.bookingsService.cancelBooking(req.user.id, id, reason || 'Người dùng tự hủy');
        return ResponseUtil.success(null, 'Hủy đặt sân thành công');
    }

    @Delete('waitlists/:id')
    async cancelWaitlist(@Req() req: any, @Param('id') id: string) {
        await this.bookingsService.cancelWaitlist(req.user.id, id);
        return ResponseUtil.success(null, 'Đã rời khỏi danh sách chờ');
    }
}
