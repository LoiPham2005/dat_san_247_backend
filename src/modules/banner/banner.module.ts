import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { BannerService } from './banner.service';
import { BannerController } from './banner.controller';
import { Banner } from './entities/banner.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Banner]),
    MulterModule.register({
      dest: './uploads/banners',
    }),
  ],
  providers: [BannerService],
  controllers: [BannerController],
})
export class BannerModule { }
