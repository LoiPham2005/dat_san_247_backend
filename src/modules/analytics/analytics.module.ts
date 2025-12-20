// modules/analytics/analytics.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from '../bookings/entities/booking.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Venue } from '../venues/entities/venue.entity';
import { CommissionRecord } from '../commissions/entities/commission-record.entity';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Payment, Venue, CommissionRecord]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}