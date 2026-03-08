import { Module } from '@nestjs/common';
import { VenueStaffService } from './venue-staff.service';
import { VenueStaffInviteService } from './venue-staff-invite.service';
import { OwnerController } from './controllers/owner.controller';
import { StaffController } from './controllers/staff.controller';

@Module({
    controllers: [OwnerController, StaffController],
    providers: [VenueStaffService, VenueStaffInviteService],
    exports: [VenueStaffService],
})
export class VenueStaffModule { }
