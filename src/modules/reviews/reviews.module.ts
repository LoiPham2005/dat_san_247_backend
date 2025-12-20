// modules/reviews/reviews.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Venue } from '../venues/entities/venue.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { VenuesModule } from '../venues/venues.module';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, Venue, Booking]),
    VenuesModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}