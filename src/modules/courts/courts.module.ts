// =====================================================
// 2. COURTS MODULE - Complete
// =====================================================

// modules/courts/courts.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Court } from './entities/court.entity';
import { PricingRule } from './entities/pricing-rule.entity';
import { Venue } from '../venues/entities/venue.entity';
import { CourtsController } from './courts.controller';
import { CourtsService } from './courts.service';

@Module({
  imports: [TypeOrmModule.forFeature([Court, PricingRule, Venue])],
  controllers: [CourtsController],
  providers: [CourtsService],
  exports: [CourtsService],
})
export class CourtsModule {}