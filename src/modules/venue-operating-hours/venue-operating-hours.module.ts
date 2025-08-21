import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VenueOperatingHoursService } from './venue-operating-hours.service';
import { VenueOperatingHoursController } from './venue-operating-hours.controller';
import { VenueOperatingHour } from './entities/venue-operating-hour.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VenueOperatingHour])],
  controllers: [VenueOperatingHoursController],
  providers: [VenueOperatingHoursService],
  exports: [VenueOperatingHoursService],
})
export class VenueOperatingHoursModule {}
