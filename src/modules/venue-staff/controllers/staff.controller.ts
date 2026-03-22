import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { VenueStaffService } from '../venue-staff.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/public.decorator';

@Controller('venue-staff/invite')
export class StaffController {
    constructor(private readonly venueStaffService: VenueStaffService) { }

    @Public()
    @Get(':token')
    async getInviteDetail(@Param('token') token: string) {
        return this.venueStaffService.getInviteByToken(token);
    }

    @Post(':token/accept')
    @UseGuards(JwtAuthGuard)
    async acceptInvite(
        @Param('token') token: string,
        @CurrentUser('id') userId: string
    ) {
        return this.venueStaffService.acceptInvite(token, userId);
    }
}
