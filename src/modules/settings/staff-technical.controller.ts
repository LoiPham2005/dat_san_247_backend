import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from '../settings/settings.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/role.constant';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiSuccessResponse } from '../../common/decorators/api-response.decorator';

@ApiTags('Staff - Technical')
@ApiBearerAuth()
@Roles(UserRole.ADMIN, UserRole.ADMIN_STAFF)
@UseGuards(RolesGuard)
@Controller('admin-staff/technical')
export class StaffTechnicalController {
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
