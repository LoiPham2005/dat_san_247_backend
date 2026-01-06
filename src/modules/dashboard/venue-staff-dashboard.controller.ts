import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { VenuesService } from '../venues/venues.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/role.constant';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiSuccessResponse } from '../../common/decorators/api-response.decorator';

@ApiTags('Staff - Venue Dashboard')
@ApiBearerAuth()
@Roles(UserRole.VENUE_STAFF)
@UseGuards(RolesGuard)
@Controller('venue-staff/dashboard')
export class VenueStaffDashboardController {
    constructor(
        private readonly dashboardService: DashboardService,
        private readonly venuesService: VenuesService,
    ) { }

    @Get('overview')
    @ApiOperation({ summary: 'Tổng quan công việc hôm nay của nhân viên sân' })
    @ApiSuccessResponse()
    async getOverview(@CurrentUser('id') staffId: string) {
        const venueIds = await this.venuesService.getAssignedVenueIds(staffId);
        return this.dashboardService.getVenueStaffOverview(venueIds);
    }
}
