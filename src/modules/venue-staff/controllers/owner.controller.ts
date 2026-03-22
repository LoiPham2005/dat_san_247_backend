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
@Roles(UserRole.OWNER)
export class OwnerController {
    constructor(private readonly venueStaffService: VenueStaffService) { }

    @Get(':venueId')
    async getStaff(
        @CurrentUser('id') ownerId: string,
        @Param('venueId') venueId: string
    ) {
        return this.venueStaffService.getStaffByVenue(venueId, ownerId);
    }

    @Patch(':staffId/role')
    async updateRole(
        @CurrentUser('id') ownerId: string,
        @Param('staffId') staffId: string,
        @Body('role') role: VenueStaffRole
    ) {
        return this.venueStaffService.updateStaffRole(staffId, role, ownerId);
    }

    @Patch(':staffId/status')
    async toggleStatus(
        @CurrentUser('id') ownerId: string,
        @Param('staffId') staffId: string,
        @Body('is_active') is_active: boolean
    ) {
        return this.venueStaffService.toggleStaffStatus(staffId, is_active, ownerId);
    }

    @Post('invite')
    async invite(
        @CurrentUser('id') ownerId: string,
        @Body() body: { venue_id: string, email: string, role: VenueStaffRole }
    ) {
        return this.venueStaffService.inviteStaff(body, ownerId);
    }

    @Get(':venueId/invites')
    async getInvites(
        @CurrentUser('id') ownerId: string,
        @Param('venueId') venueId: string
    ) {
        return this.venueStaffService.getInvitesByVenue(venueId, ownerId);
    }

    @Delete('invite/:inviteId')
    async revokeInvite(
        @CurrentUser('id') ownerId: string,
        @Param('inviteId') inviteId: string
    ) {
        return this.venueStaffService.revokeInvite(inviteId, ownerId);
    }

    @Post('invite/:inviteId/force-accept')
    async forceAccept(
        @CurrentUser('id') ownerId: string,
        @Param('inviteId') inviteId: string
    ) {
        return this.venueStaffService.forceAcceptInvite(inviteId, ownerId);
    }
}
