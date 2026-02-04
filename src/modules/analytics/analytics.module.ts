import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { ActivityLog } from './entities/activity-log.entity';
import { AuditLog } from './entities/audit-log.entity';
import { VenueRevenueSnapshot } from './entities/venue-revenue-snapshot.entity';
import { UserBehavior } from './entities/user-behavior.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ActivityLog, AuditLog, VenueRevenueSnapshot, UserBehavior]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule { }
