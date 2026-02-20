import { Module, forwardRef } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { OwnerDashboardController } from './owner-dashboard.controller';
import { VenueStaffDashboardController } from './venue-staff-dashboard.controller';
import { VenuesModule } from '../venues/venues.module';
import { AdminDashboardController } from './admin-dashboard.controller';

import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => VenuesModule),
  ],
  controllers: [
    DashboardController,
    AdminDashboardController,
    OwnerDashboardController,
    VenueStaffDashboardController,
  ],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule { }
