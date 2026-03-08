import { Controller, Get, Post, Body, Param, Patch, Delete, Query, UseGuards } from '@nestjs/common';
import { UsersAdminService } from '../users-admin.service';
import { QueryUsersDto } from '../dto/query-users.dto';
import { AdminUpdateUserDto } from '../dto/admin-update-user.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { UserRole } from '../../../common/constants/role.constant';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { ResponseUtil } from '../../../common/utils/response.util';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class AdminController {
    constructor(private readonly usersAdminService: UsersAdminService) { }

    @Get()
    @Permissions('users:read')
    @ResponseMessage('Users retrieved successfully')
    async findAll(@Query() query: QueryUsersDto) {
        const { items, total } = await this.usersAdminService.findMany(query);
        return ResponseUtil.paginated(
            items,
            total,
            query.page || 1,
            query.limit || 10,
            'Users list retrieved successfully'
        );
    }

    @Get(':id')
    @Permissions('users:read')
    @ResponseMessage('User details retrieved successfully')
    async findOne(@Param('id') id: string) {
        return this.usersAdminService.findById(id);
    }

    @Patch(':id')
    @Permissions('users:manage')
    @ResponseMessage('User updated successfully')
    async update(@Param('id') id: string, @Body() dto: AdminUpdateUserDto) {
        return this.usersAdminService.update(id, dto);
    }

    @Delete(':id')
    @Permissions('users:manage')
    @ResponseMessage('User deleted successfully')
    async remove(@Param('id') id: string) {
        return this.usersAdminService.delete(id);
    }
}
