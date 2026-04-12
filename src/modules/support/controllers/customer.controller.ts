import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ReportsService } from '../reports.service';
import { TicketsService } from '../tickets.service';
import { ResponseUtil } from '../../../common/utils/response.util';

@Controller('support')
@UseGuards(JwtAuthGuard)
export class CustomerController {
    constructor(
        private reportsService: ReportsService,
        private ticketsService: TicketsService
    ) {}

    @Post('reports')
    async createReport(@Body() data: any, @Req() req: any) {
        const result = await this.reportsService.createReport(req.user.id, data);
        return ResponseUtil.success(result, 'Gửi báo cáo thành công');
    }

    @Get('tickets')
    async getMyTickets(@Req() req: any) {
        const result = await this.ticketsService.getMyTickets(req.user.id);
        return ResponseUtil.success(result, 'Lấy danh sách ticket thành công');
    }

    @Post('tickets')
    async createTicket(@Body() data: any, @Req() req: any) {
        const result = await this.ticketsService.createTicket(req.user.id, data);
        return ResponseUtil.success(result, 'Tạo ticket thành công');
    }
}
