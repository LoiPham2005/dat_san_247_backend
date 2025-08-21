import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VenueStatisticsService } from './venue-statistics.service';
import { VenueStatisticsController } from './venue-statistics.controller';
import { VenueStatistic } from './entities/venue-statistic.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VenueStatistic])],
  controllers: [VenueStatisticsController],
  providers: [VenueStatisticsService],
  exports: [VenueStatisticsService],
})
export class VenueStatisticsModule {}
