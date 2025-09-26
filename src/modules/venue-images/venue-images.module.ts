import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VenueImagesService } from './venue-images.service';
import { VenueImagesController } from './venue-images.controller';
import { VenueImage } from './entities/venue-image.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { SharedModule } from 'src/common/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VenueImage]), // chỉ entity thôi
    // CloudinaryModule,
    SharedModule, // import module chứa FileUploadHelper + EntityHelper
  ],
  controllers: [VenueImagesController],
  providers: [VenueImagesService],
  exports: [VenueImagesService], // chỉ export nếu module khác cần Service này
})
export class VenueImagesModule {}
