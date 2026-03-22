import { Controller, Get, Patch, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/constants/role.constant';
import { TicketsService } from '../tickets.service';
import { ReportsService } from '../reports.service';
import { ReviewsService } from '../reviews.service';

@Controller('admin/support')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STAFF)
export class AdminController {
    constructor(
        private ticketsService: TicketsService,
        private reportsService: ReportsService,
        private reviewsService: ReviewsService
    ) {}

    @Get('tickets')
    getTickets() {
        return this.ticketsService.getAllTickets();
    }

    @Patch('tickets/:id')
    updateTicket(@Param('id') id: string, @Body() data: any) {
        return this.ticketsService.updateTicket(id, data);
    }

    @Get('reports')
    getReports() {
        return this.reportsService.getAllReports();
    }

    @Patch('reports/:id')
    updateReport(@Param('id') id: string, @Body() data: any) {
        return this.reportsService.updateReport(id, data);
    }

    @Get('reviews')
    getReviews() {
        return this.reviewsService.getAllReviews();
    }

    @Patch('reviews/:id')
    updateReview(@Param('id') id: string, @Body() data: any, @Req() req: any) {
        return this.reviewsService.updateReview(id, data, req.user?.id);
    }

    @Delete('reviews/:id')
    deleteReview(@Param('id') id: string) {
        return this.reviewsService.deleteReview(id);
    }
}
