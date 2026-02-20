import { Module, forwardRef } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { OwnerBookingsController } from './owner-bookings.controller';
import { VenueStaffBookingsController } from './venue-staff-bookings.controller';
import { VenuesModule } from '../venues/venues.module';
import { AdminBookingsController } from './admin-bookings.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => VenuesModule),
  ],
  controllers: [
    BookingsController,
    AdminBookingsController,
    OwnerBookingsController,
    VenueStaffBookingsController,
  ],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule { }
