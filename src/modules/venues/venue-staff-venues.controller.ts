import { Controller, Get, Post, Body, Param, Put, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VenuesService } from './venues.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/role.constant';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiSuccessResponse } from '../../common/decorators/api-response.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Staff - Venue Management')
@ApiBearerAuth()
@Roles(UserRole.VENUE_STAFF)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('venue-staff/venues')
export class VenueStaffVenuesController {
    constructor(private readonly venuesService: VenuesService) { }

    @Get()
    @ApiOperation({ summary: 'Danh sách sân được gán' })
    @ApiSuccessResponse(Object, true)
    async findAll(@CurrentUser('id') staffId: string) {
        const venueIds = await this.venuesService.getAssignedVenueIds(staffId);
        return this.venuesService.findByIds(venueIds);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Chi tiết sân' })
    @ApiSuccessResponse(Object)
    async findOne(@CurrentUser('id') staffId: string, @Param('id') id: string) {
        await this.checkPermission(staffId, id);
        return this.venuesService.findOne(id);
    }

    @Put(':id/status')
    @ApiOperation({ summary: 'Cập nhật trạng thái sân (Bảo trì...)' })
    @ApiSuccessResponse()
    async updateStatus(@CurrentUser('id') staffId: string, @Param('id') id: string, @Body('status') status: any) {
        await this.checkPermission(staffId, id);
        return this.venuesService.updateStatus(id, status);
    }

    private async checkPermission(staffId: string, venueId: string) {
        const venueIds = await this.venuesService.getAssignedVenueIds(staffId);
        if (!venueIds.includes(venueId)) {
            throw new UnauthorizedException('You are not assigned to this venue');
        }
    }
}
