import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserRole } from '../../common/constants/role.constant';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserFilterDto } from './dto/user-filter.dto';
import { ApiSuccessResponse, ApiPaginatedResponse } from '../../common/decorators/api-response.decorator';


import { RolesService } from '../roles/roles.service';

@ApiTags('Admin - Users')
@ApiBearerAuth()
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/users')
export class AdminUsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly rolesService: RolesService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách người dùng' })
    @ApiPaginatedResponse(Object)
    async findAll(@Query() filter: UserFilterDto) {
        return this.usersService.findAll(filter);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết người dùng' })
    @ApiSuccessResponse(Object)
    async findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: 'Tạo mới người dùng' })
    @ApiSuccessResponse(Object)
    async create(@Body() data: any) {
        if (data.role) {
            const role = await this.rolesService.findBySlug(data.role);
            data.role = role;
        }
        return this.usersService.create(data);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Cập nhật thông tin người dùng' })
    @ApiSuccessResponse()
    async update(@Param('id') id: string, @Body() data: any) {
        if (data.role) {
            const role = await this.rolesService.findBySlug(data.role);
            data.role = role;
        }
        return this.usersService.update(id, data);
    }

    @Post(':id/toggle-status')
    @ApiOperation({ summary: 'Khóa/Mở khóa tài khoản' })
    @ApiSuccessResponse()
    async toggleStatus(@Param('id') id: string) {
        return this.usersService.toggleStatus(id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa người dùng (Soft Delete)' })
    @ApiSuccessResponse()
    async remove(@Param('id') id: string) {
        return this.usersService.softDelete(id);
    }

    @Post(':id/restore')
    @ApiOperation({ summary: 'Khôi phục người dùng đã xóa' })
    @ApiSuccessResponse()
    async restore(@Param('id') id: string) {
        return this.usersService.restore(id);
    }
}
