import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsService } from './settings.service';
import { SuperAdminSettingsController } from './super-admin-settings.controller';
import { SuperAdminTechnicalController } from './super-admin-technical.controller';
import { Setting } from './entities/setting.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Setting])],
    controllers: [SuperAdminSettingsController, SuperAdminTechnicalController],
    providers: [SettingsService],
    exports: [SettingsService],
})
export class SettingsModule { }
