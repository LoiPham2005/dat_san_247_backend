import { Controller, Get, Query } from '@nestjs/common';
import { AppVersionsService } from '../app-versions.service';
import { AppPlatform } from '@prisma/client';

@Controller('public/app-versions')
export class PublicController {
    constructor(private appVersionsService: AppVersionsService) { }

    @Get('check')
    async checkVersion(
        @Query('platform') platform: AppPlatform,
        @Query('version') currentVersion: string
    ) {
        // Simple placeholder logic for version check
        const versions = await this.appVersionsService.getAllAppVersions();
        const latest = versions.find(v => v.platform === platform && v.is_active);
        
        return {
            latest_version: latest?.version_number || currentVersion,
            is_force_update: latest?.is_force_update || false,
            download_url: latest?.download_url || '',
            release_notes: latest?.release_notes || ''
        };
    }
}
