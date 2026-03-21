import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/constants/role.constant';
import { TicketsService } from '../tickets.service';
import { ReportsService } from '../reports.service';

@Controller('admin/support')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminController {
    constructor(
        private ticketsService: TicketsService,
        private reportsService: ReportsService
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
}
