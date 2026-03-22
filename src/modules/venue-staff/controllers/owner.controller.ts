import { Controller, Get, Post, Patch, Param, Body, UseGuards, Delete } from '@nestjs/common';
import { VenueStaffService } from '../venue-staff.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/constants/role.constant';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { VenueStaffRole } from '@prisma/client';

@Controller('venue-staff/owner')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.VENUE_STAFF)
export class OwnerController {
    constructor(private readonly venueStaffService: VenueStaffService) { }

    @Get(':venueId')
    async getStaff(
        @CurrentUser('id') userId: string,
        @Param('venueId') venueId: string
    ) {
        return this.venueStaffService.getStaffByVenue(venueId, userId);
    }

    @Patch(':staffId/role')
    async updateRole(
        @CurrentUser('id') userId: string,
        @Param('staffId') staffId: string,
        @Body('role') role: VenueStaffRole
    ) {
        return this.venueStaffService.updateStaffRole(staffId, role, userId);
    }

    @Patch(':staffId/status')
    async toggleStatus(
        @CurrentUser('id') userId: string,
        @Param('staffId') staffId: string,
        @Body('is_active') is_active: boolean
    ) {
        return this.venueStaffService.toggleStaffStatus(staffId, is_active, userId);
    }

    @Post('invite')
    async invite(
        @CurrentUser('id') userId: string,
        @Body() body: { venue_id: string, email: string, role: VenueStaffRole }
    ) {
        return this.venueStaffService.inviteStaff(body, userId);
    }

    @Get(':venueId/invites')
    async getInvites(
        @CurrentUser('id') userId: string,
        @Param('venueId') venueId: string
    ) {
        return this.venueStaffService.getInvitesByVenue(venueId, userId);
    }

    @Delete('invite/:inviteId')
    async revokeInvite(
        @CurrentUser('id') userId: string,
        @Param('inviteId') inviteId: string
    ) {
        return this.venueStaffService.revokeInvite(inviteId, userId);
    }

    @Post('invite/:inviteId/force-accept')
    async forceAccept(
        @CurrentUser('id') userId: string,
        @Param('inviteId') inviteId: string
    ) {
        return this.venueStaffService.forceAcceptInvite(inviteId, userId);
    }
}
