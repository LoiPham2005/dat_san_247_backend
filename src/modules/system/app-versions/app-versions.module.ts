import { Module } from '@nestjs/common';
import { AppVersionsService } from './app-versions.service';
import { PublicController } from './controllers/public.controller';
import { AdminController } from './controllers/admin.controller';

@Module({
    controllers: [PublicController, AdminController],
    providers: [AppVersionsService],
    exports: [AppVersionsService],
})
export class AppVersionsModule { }
