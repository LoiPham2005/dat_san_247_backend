import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VenueImagesService } from './venue-images.service';
import { VenueImagesController } from './venue-images.controller';
import { VenueImage } from './entities/venue-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VenueImage])],
  controllers: [VenueImagesController],
  providers: [VenueImagesService],
  exports: [VenueImagesService],
})
export class VenueImagesModule {}
