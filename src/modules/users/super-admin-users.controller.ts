// import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
// import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
// import { UsersService } from './users.service';
// import { Roles } from '../../common/decorators/roles.decorator';
// import { UserRole } from '../../common/constants/role.constant';
// import { RolesGuard } from '../../common/guards/roles.guard';
// import { UserFilterDto } from './dto/user-filter.dto';
// import { ApiSuccessResponse, ApiPaginatedResponse } from '../../common/decorators/api-response.decorator';
// import { User } from './entities/user.entity';

// @ApiTags('Super Admin - Users')
// @ApiBearerAuth()
// @Roles(UserRole.SUPER_ADMIN)
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Controller('super-admin/users')
// export class SuperAdminUsersController {
//     constructor(private readonly usersService: UsersService) { }

//     @Get()
//     @ApiOperation({ summary: 'Lấy danh sách người dùng' })
//     @ApiPaginatedResponse(User)
//     async findAll(@Query() filter: UserFilterDto) {
//         return this.usersService.findAll(filter);
//     }

//     @Get(':id')
//     @ApiOperation({ summary: 'Lấy chi tiết người dùng' })
//     @ApiSuccessResponse(User)
//     async findOne(@Param('id') id: string) {
//         return this.usersService.findOne(id);
//     }

//     @Post()
//     @ApiOperation({ summary: 'Tạo mới người dùng' })
//     @ApiSuccessResponse(User)
//     async create(@Body() data: any) {
//         return this.usersService.create(data);
//     }

//     @Put(':id')
//     @ApiOperation({ summary: 'Cập nhật thông tin người dùng' })
//     @ApiSuccessResponse()
//     async update(@Param('id') id: string, @Body() data: any) {
//         return this.usersService.update(id, data);
//     }

//     @Post(':id/toggle-status')
//     @ApiOperation({ summary: 'Khóa/Mở khóa tài khoản' })
//     @ApiSuccessResponse()
//     async toggleStatus(@Param('id') id: string) {
//         return this.usersService.toggleStatus(id);
//     }

//     @Delete(':id')
//     @ApiOperation({ summary: 'Xóa người dùng (Soft Delete)' })
//     @ApiSuccessResponse()
//     async remove(@Param('id') id: string) {
//         return this.usersService.softDelete(id);
//     }
// }
