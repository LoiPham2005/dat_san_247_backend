import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BannerService } from './banner.service';
import { BannerController } from './banner.controller';
import { Banner } from './entities/banner.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { SharedModule } from 'src/common/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Banner]),
    SharedModule
  ],
  providers: [BannerService],
  controllers: [BannerController],
})
export class BannerModule {}
