import { Module } from '@nestjs/common';
import { BannerService } from './banner.service';
import { AdminController } from './controllers/admin.controller';
import { ContentService } from './content.service';

@Module({
    controllers: [AdminController],
    providers: [BannerService, ContentService],
    exports: [BannerService, ContentService],
})
export class ContentModule { }
