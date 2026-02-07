import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsService } from './settings.service';
import { Setting } from './entities/setting.entity';


@Module({
    imports: [],
    controllers: [],
    providers: [SettingsService],
    exports: [SettingsService],
})
export class SettingsModule { }
