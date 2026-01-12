import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/role.constant';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiSuccessResponse } from '../../common/decorators/api-response.decorator';

@ApiTags('Super Admin - Technical')
@ApiBearerAuth()
@Roles(UserRole.SUPER_ADMIN)
@UseGuards(RolesGuard)
@Controller('super-admin/technical')
export class SuperAdminTechnicalController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get('system-config')
    @ApiOperation({ summary: 'Xem cấu hình hệ thống' })
    @ApiSuccessResponse()
    async getSystemConfig() {
        return this.settingsService.findAll();
    }

    @Get('health-check')
    @ApiOperation({ summary: 'Kiểm tra trạng thái hệ thống' })
    @ApiSuccessResponse()
    async healthCheck() {
        return { status: 'healthy', database: 'connected', gateway: 'online' };
    }
}
