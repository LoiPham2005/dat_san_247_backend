import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommissionRecord } from './entities/commission-record.entity';
import { CommissionsService } from './commissions.service';
import { CommissionsController } from './commissions.controller';
import { Booking } from '../bookings/entities/booking.entity';
import { VenueOwner } from '../venue-owners/entities/venue-owner.entity';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommissionRecord, Booking, VenueOwner]),
    SettingsModule,
  ],
  controllers: [CommissionsController],
  providers: [CommissionsService],
  exports: [CommissionsService],
})
export class CommissionsModule {}