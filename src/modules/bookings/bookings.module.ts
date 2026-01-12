import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { SuperAdminBookingsController } from './super-admin-bookings.controller';
import { OwnerBookingsController } from './owner-bookings.controller';
import { VenueStaffBookingsController } from './venue-staff-bookings.controller';
import { Booking } from './entities/booking.entity';
import { VenuesModule } from '../venues/venues.module';
import { AdminBookingsController } from './admin-bookings.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking]),
    forwardRef(() => VenuesModule),
  ],
  controllers: [
    BookingsController,
    AdminBookingsController,
    SuperAdminBookingsController,
    OwnerBookingsController,
    VenueStaffBookingsController,
  ],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule { }
