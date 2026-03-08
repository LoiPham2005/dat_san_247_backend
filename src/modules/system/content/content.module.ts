import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { BannerService } from './banner.service';
import { PublicController } from './controllers/public.controller';
import { AdminController } from './controllers/admin.controller';

@Module({
    controllers: [PublicController, AdminController],
    providers: [ContentService, BannerService],
    exports: [ContentService, BannerService],
})
export class ContentModule { }
