import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
// import { BookingsQueryService } from './bookings-query.service';
// import { CheckinService } from './checkin.service';
// import { WaitlistService } from './waitlist.service';
// import { RecurringService } from './recurring.service';
// import { VenueServicesService } from './venue-services.service';
import { CustomerController } from './controllers/customer.controller';
import { VenueStaffController } from './controllers/venue-staff.controller';
import { OwnerController } from './controllers/owner.controller';
import { AdminController } from './controllers/admin.controller';

@Module({
    controllers: [
        CustomerController,
        VenueStaffController,
        OwnerController,
        AdminController,
    ],
    providers: [
        BookingsService,
        // BookingsQueryService,
        // CheckinService,
        // WaitlistService,
        // RecurringService,
        // VenueServicesService,
    ],
    exports: [BookingsService],
})
export class BookingsModule { }
