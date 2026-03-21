import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { UserRole } from '../../../../common/constants/role.constant';
import { SettingsService } from '../settings.service';

@Controller('admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminController {
    constructor(private settingsService: SettingsService) {}

    @Get()
    getAllSettings() {
        return this.settingsService.getAllSettings();
    }

    @Patch(':id')
    updateSetting(@Param('id') id: string, @Body('value') value: string) {
        return this.settingsService.updateSetting(id, value);
    }

    @Patch('key/:key')
    updateSettingByKey(@Param('key') key: string, @Body('value') value: string) {
        return this.settingsService.updateSettingByKey(key, value);
    }
}
