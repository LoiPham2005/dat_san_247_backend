import { Controller, Get, Post, Put, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SupportService } from './support.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/role.constant';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiSuccessResponse } from '../../common/decorators/api-response.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Staff - Support')
@ApiBearerAuth()
@Roles(UserRole.STAFF)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('staff/support')
export class StaffSupportController {
    constructor(private readonly supportService: SupportService) { }

    @Get('dashboard')
    @ApiOperation({ summary: 'Dashboard CSKH' })
    @ApiSuccessResponse()
    async getDashboard() {
        return this.supportService.getStats();
    }

    @Get('tickets')
    @ApiOperation({ summary: 'Danh sách tickets' })
    @ApiSuccessResponse(Object, true)
    async findAll(@Query() filter: any) {
        return this.supportService.findAllTickets(filter);
    }

    @Get('tickets/:id')
    @ApiOperation({ summary: 'Chi tiết ticket' })
    @ApiSuccessResponse(Object)
    async findOne(@Param('id') id: string) {
        return this.supportService.findOneTicket(id);
    }

    @Put('tickets/:id')
    @ApiOperation({ summary: 'Cập nhật ticket (Assign, status)' })
    @ApiSuccessResponse()
    async update(@Param('id') id: string, @Body() data: any) {
        return this.supportService.updateTicket(id, data);
    }
}
