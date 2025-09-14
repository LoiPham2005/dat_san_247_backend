import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VenuesService } from './venues.service';
import { VenuesController } from './venues.controller';
import { Venue } from './entities/venue.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { VenueImage } from '../venue-images/entities/venue-image.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Venue, VenueImage]),
    CloudinaryModule,
  ],
  controllers: [VenuesController],
  providers: [VenuesService],
  exports: [VenuesService],
})
export class VenuesModule { }
