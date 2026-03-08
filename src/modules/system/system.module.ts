import { Module } from '@nestjs/common';
import { FilesModule } from './files/files.module';
import { ContentModule } from './content/content.module';
import { SystemSettingsModule } from './settings/settings.module';
import { HolidaysModule } from './holidays/holidays.module';
import { AuditModule } from './audit/audit.module';
import { AppVersionsModule } from './app-versions/app-versions.module';
import { FavoritesModule } from './favorites/favorites.module';

@Module({
    imports: [
        FilesModule,
        ContentModule,
        SystemSettingsModule,
        HolidaysModule,
        AuditModule,
        AppVersionsModule,
        FavoritesModule,
    ],
    exports: [FilesModule],
})
export class SystemModule { }
