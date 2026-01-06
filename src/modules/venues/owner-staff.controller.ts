import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VenuesService } from './venues.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/role.constant';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiSuccessResponse } from '../../common/decorators/api-response.decorator';

@ApiTags('Owner - Staff')
@ApiBearerAuth()
@Roles(UserRole.OWNER)
@UseGuards(RolesGuard)
@Controller('owner/staff')
export class OwnerStaffController {
    constructor(private readonly venuesService: VenuesService) { }

    @Get()
    @ApiOperation({ summary: 'Danh sách nhân viên của tất cả sân thuộc chủ sở hữu' })
    @ApiSuccessResponse()
    async findAll(@CurrentUser('id') ownerId: string) {
        return this.venuesService.findAllStaffByOwner(ownerId);
    }

    @Post()
    @ApiOperation({ summary: 'Thêm nhân viên mới và gán vào sân' })
    @ApiSuccessResponse()
    async create(@CurrentUser('id') ownerId: string, @Body() data: any) {
        return this.venuesService.createStaff(ownerId, data);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa nhân viên (Gỡ khỏi sân)' })
    @ApiSuccessResponse()
    async remove(@CurrentUser('id') ownerId: string, @Param('id') id: string) {
        return this.venuesService.removeStaff(ownerId, id);
    }
}
