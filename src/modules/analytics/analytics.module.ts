import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { ActivityLog } from './entities/activity-log.entity';
import { AuditLog } from './entities/audit-log.entity';
import { VenueRevenueSnapshot } from './entities/venue-revenue-snapshot.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ActivityLog, AuditLog, VenueRevenueSnapshot]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule { }
