import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VenuesService } from './venues.service';
import { VenuesController } from './venues.controller';
import { OwnerVenuesController } from './owner-venues.controller';
import { OwnerStaffController } from './owner-staff.controller';
import { VenueStaffVenuesController } from './venue-staff-venues.controller';
import { StaffModerationController } from './staff-moderation.controller';
import { AdminVenuesController } from './admin-venues.controller';
import { Venue } from './entities/venue.entity';
import { VenueImage } from './entities/venue-image.entity';
import { VenueAmenity } from './entities/venue-amenity.entity';
import { FavoriteVenue } from './entities/favorite-venue.entity';
import { VenueMembership } from './entities/venue-membership.entity';
import { VenueService } from './entities/venue-service.entity';
import { VenueStaff } from './entities/venue-staff.entity';
import { PricingRule } from '../time-slots/entities/pricing-rule.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { UsersModule } from '../users/users.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { Organization } from './entities/organization.entity';
import { VenueScheduleException } from './entities/schedule-exception.entity';
import { RefundPolicy } from './entities/refund-policy.entity';
import { StaffShift } from './entities/staff-shift.entity';
import { VenueOpeningHour } from './entities/opening-hour.entity';
import { VenueVerification } from './entities/venue-verification.entity';
import { VenueBlacklist } from './entities/venue-blacklist.entity';




@Module({
  imports: [
    TypeOrmModule.forFeature([
      Venue,
      VenueImage,
      VenueAmenity,
      FavoriteVenue,
      VenueMembership,
      VenueService,
      VenueStaff,
      PricingRule,
      Booking,
      Organization,
      VenueScheduleException,
      RefundPolicy,
      StaffShift,
      VenueOpeningHour,
      VenueVerification,
      VenueBlacklist
    ]),


    forwardRef(() => UsersModule),
    forwardRef(() => ReviewsModule),
    AnalyticsModule,
  ],
  controllers: [
    VenuesController,
    OwnerVenuesController,
    OwnerStaffController,
    StaffModerationController,
    VenueStaffVenuesController,
    AdminVenuesController,
  ],
  providers: [VenuesService],
  exports: [VenuesService],
})
export class VenuesModule { }
