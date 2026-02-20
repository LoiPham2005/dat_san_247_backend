import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/role.constant';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PromotionFilterDto } from './dto/promotion-filter.dto';
import { ApiSuccessResponse, ApiPaginatedResponse } from '../../common/decorators/api-response.decorator';

import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Admin - Promotions')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/promotions')
export class AdminPromotionsController {
    constructor(private readonly promotionsService: PromotionsService) { }

    @Get()
    @ApiOperation({ summary: 'Danh sách mã giảm giá' })
    @ApiPaginatedResponse(Object)
    async findAll(@Query() filter: PromotionFilterDto) {
        return this.promotionsService.findAll(filter);
    }

    @Post()
    @ApiOperation({ summary: 'Tạo mã giảm giá mới' })
    @ApiSuccessResponse()
    async create(@Body() data: any) {
        return this.promotionsService.create(data);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Cập nhật mã giảm giá' })
    @ApiSuccessResponse()
    async update(@Param('id') id: string, @Body() data: any) {
        return this.promotionsService.update(id, data);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa mã giảm giá' })
    @ApiSuccessResponse()
    async remove(@Param('id') id: string) {
        return this.promotionsService.softDelete(id);
    }
}
