// src/modules/bookings/booking.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { SportsField } from '../sports-fields/entities/sports-fields.entities';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, SportsField, User])],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
