import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Banner } from './entities/banner.entity';
import { BannerAnalytics } from './entities/banner-analytics';
import { BannersService } from './banners.service';
import { BannersController } from './banners.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Banner, BannerAnalytics])],
  controllers: [BannersController],
  providers: [BannersService],
  exports: [BannersService],
})
export class BannersModule { }