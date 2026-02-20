import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuditService } from './audit.service';
import { AnalyticsController } from './analytics.controller';

import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AuditService],
  exports: [AnalyticsService, AuditService],
})
export class AnalyticsModule { }

