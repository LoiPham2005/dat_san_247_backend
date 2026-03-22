import { Module } from '@nestjs/common';
import { VenueStaffService } from './venue-staff.service';
import { OwnerController } from './controllers/owner.controller';
import { StaffController } from './controllers/staff.controller';

@Module({
    controllers: [OwnerController, StaffController],
    providers: [VenueStaffService],
    exports: [VenueStaffService],
})
export class VenueStaffModule { }
