import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuditService } from './audit.service';
import { AnalyticsController } from './analytics.controller';

@Module({
  imports: [],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AuditService],
  exports: [AnalyticsService, AuditService],
})
export class AnalyticsModule { }
