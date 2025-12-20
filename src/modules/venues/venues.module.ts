// =====================================================
// 1. VENUES MODULE - Complete Implementation
// =====================================================

// modules/venues/venues.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venue } from './entities/venue.entity';
import { VenuesService } from './venues.service';
import { VenuesController } from './venues.controller';
import { VenueImage } from './entities/venue-image.entity';
import { Court } from '../courts/entities/court.entity';
import { Review } from '../reviews/entities/review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Venue, VenueImage, Court, Review])],
  controllers: [VenuesController],
  providers: [VenuesService],
  exports: [VenuesService],
})
export class VenuesModule {}
