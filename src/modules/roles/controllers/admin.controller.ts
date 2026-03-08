import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { RolesService } from '../roles.service';
import { SyncPermissionsDto, UpdateRolePermissionsDto } from '../dto/sync-permissions.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { UserRole } from '../../../common/constants/role.constant';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';

@Controller('admin/roles')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class AdminController {
    constructor(private readonly rolesService: RolesService) { }

    @Get()
    @Permissions('roles:read')
    @ResponseMessage('Roles retrieved successfully')
    async findAll() {
        return this.rolesService.findAllRoles();
    }

    @Get('permissions')
    @Permissions('roles:read') // Quyền quản lý role bao gồm xem permissions có sẵn
    @ResponseMessage('Permissions retrieved successfully')
    async findAllPermissions() {
        return this.rolesService.findAllPermissions();
    }

    @Get(':slug')
    @Permissions('roles:read')
    @ResponseMessage('Role details retrieved successfully')
    async findOne(@Param('slug') slug: string) {
        return this.rolesService.findRoleBySlug(slug);
    }

    @Post('sync-permissions')
    @Permissions('roles:manage')
    @ResponseMessage('Permissions synced successfully')
    async sync(@Body() dto: SyncPermissionsDto) {
        return this.rolesService.syncPermissions(dto);
    }

    @Patch(':roleId/permissions')
    @Permissions('roles:manage')
    @ResponseMessage('Role permissions updated successfully')
    async updatePermissions(
        @Param('roleId') roleId: string,
        @Body() dto: UpdateRolePermissionsDto
    ) {
        return this.rolesService.updateRolePermissions(roleId, dto);
    }
}
