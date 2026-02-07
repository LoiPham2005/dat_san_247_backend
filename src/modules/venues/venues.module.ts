import { Module, forwardRef } from '@nestjs/common';
import { VenuesService } from './venues.service';
import { VenuesController } from './venues.controller';
import { OwnerVenuesController } from './owner-venues.controller';
import { OwnerStaffController } from './owner-staff.controller';
import { VenueStaffVenuesController } from './venue-staff-venues.controller';
import { StaffModerationController } from './staff-moderation.controller';
import { AdminVenuesController } from './admin-venues.controller';
import { UsersModule } from '../users/users.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { PrismaModule } from '../../prisma/prisma.module';


@Module({
  imports: [
    PrismaModule,
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
