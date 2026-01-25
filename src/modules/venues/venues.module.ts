import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VenuesService } from './venues.service';
import { VenuesController } from './venues.controller';
import { SuperAdminVenuesController } from './super-admin-venues.controller';
import { OwnerVenuesController } from './owner-venues.controller';
import { OwnerStaffController } from './owner-staff.controller';
import { SuperAdminModerationController } from './super-admin-moderation.controller';
import { VenueStaffVenuesController } from './venue-staff-venues.controller';
import { StaffModerationController } from './staff-moderation.controller';
import { AdminVenuesController } from './admin-venues.controller';
import { Venue } from './entities/venue.entity';
import { VenueImage } from './entities/venue-image.entity';
import { VenueAmenity } from './entities/venue-amenity.entity';
import { FavoriteVenue } from './entities/favorite-venue.entity';
import { VenueStaff } from './entities/venue-staff.entity';
import { PricingRule } from '../time-slots/entities/pricing-rule.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { UsersModule } from '../users/users.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Venue,
      VenueImage,
      VenueAmenity,
      FavoriteVenue,
      VenueStaff,
      PricingRule,
      Booking
    ]),
    forwardRef(() => UsersModule),
    forwardRef(() => ReviewsModule),
    AnalyticsModule,
  ],
  controllers: [
    VenuesController,
    SuperAdminVenuesController,
    OwnerVenuesController,
    OwnerStaffController,
    StaffModerationController,
    SuperAdminModerationController,
    VenueStaffVenuesController,
    AdminVenuesController,
  ],
  providers: [VenuesService],
  exports: [VenuesService],
})
export class VenuesModule { }
