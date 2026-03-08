import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { AdminController } from './controllers/admin.controller';

@Module({
    controllers: [AdminController],
    providers: [SettingsService],
    exports: [SettingsService],
})
export class SystemSettingsModule { }
