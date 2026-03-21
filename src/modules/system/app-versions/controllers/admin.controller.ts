import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { UserRole } from '../../../../common/constants/role.constant';
import { AppVersionsService } from '../app-versions.service';

@Controller('admin/app-versions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminController {
    constructor(private appVersionsService: AppVersionsService) {}

    @Get()
    getAllVersions() {
        return this.appVersionsService.getAllAppVersions();
    }

    @Post()
    createVersion(@Body() data: any) {
        return this.appVersionsService.createVersion(data);
    }

    @Patch(':id')
    updateVersion(@Param('id') id: string, @Body() data: any) {
        return this.appVersionsService.updateVersion(id, data);
    }

    @Delete(':id')
    deleteVersion(@Param('id') id: string) {
        return this.appVersionsService.deleteVersion(id);
    }
}
