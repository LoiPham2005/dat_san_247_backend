import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { SearchHistory } from './entities/search-history.entity';
import { Venue } from '../venues/entities/venue.entity';
import { Court } from '../courts/entities/court.entity';
import { SportType } from '../sport-types/entities/sport-type.entity';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([SearchHistory, Venue, Court, SportType]),
    CacheModule.register(),
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}