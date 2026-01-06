import { Controller, Get, Post, Body, Put, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/role.constant';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiSuccessResponse } from '../../common/decorators/api-response.decorator';

@ApiTags('Admin - Settings')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@UseGuards(RolesGuard)
@Controller('admin/settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get()
    @ApiOperation({ summary: 'Lấy toàn bộ cấu hình hệ thống' })
    @ApiSuccessResponse()
    async findAll() {
        return this.settingsService.findAll();
    }

    @Post()
    @ApiOperation({ summary: 'Cập nhật hoặc tạo cấu hình' })
    @ApiSuccessResponse()
    async upsert(@Body() data: any) {
        return this.settingsService.upsert(data);
    }
}
