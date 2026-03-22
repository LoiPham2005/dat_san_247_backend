import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ReportsService } from '../reports.service';

@Controller('support')
@UseGuards(JwtAuthGuard)
export class CustomerController {
    constructor(private reportsService: ReportsService) {}

    @Post('reports')
    createReport(@Body() data: any, @Req() req: any) {
        return this.reportsService.createReport(req.user.id, data);
    }
}
