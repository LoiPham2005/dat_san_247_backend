import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourtsService } from './courts.service';
import { CourtsController } from './courts.controller';
import { Court } from './entities/court.entity';
import { CourtImage } from './entities/court-image.entity';
import { PricingRule } from '../time-slots/entities/pricing-rule.entity';
import { VenuesModule } from '../venues/venues.module';
import { OwnerCourtsController } from './owner-courts.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Court, CourtImage, PricingRule]),
    forwardRef(() => VenuesModule),
  ],
  controllers: [CourtsController, OwnerCourtsController],
  providers: [CourtsService],
  exports: [CourtsService],
})
export class CourtsModule { }
