import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { Booking } from './entities/booking.entity';
import { Court } from '../courts/entities/court.entity';
import { PricingRule } from '../courts/entities/pricing-rule.entity';
import { Venue } from '../venues/entities/venue.entity';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { BookingProcessor } from './processors/booking.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Court, PricingRule, Venue]),
    BullModule.registerQueue({
      name: 'bookings',
    }),
  ],
  controllers: [BookingsController],
  providers: [BookingsService, BookingProcessor],
  exports: [BookingsService],
})
export class BookingsModule {}