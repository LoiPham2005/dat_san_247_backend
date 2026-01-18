import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CourtsService } from './courts.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/role.constant';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiSuccessResponse } from '../../common/decorators/api-response.decorator';
import { Court } from './entities/court.entity';

@ApiTags('Owner - Courts')
@ApiBearerAuth()
@Roles(UserRole.OWNER)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('owner/courts')
export class OwnerCourtsController {
    constructor(private readonly courtsService: CourtsService) { }

    @Get('venue/:venueId')
    @ApiOperation({ summary: 'Danh sách sân nhỏ của một sân lớn' })
    @ApiSuccessResponse(Court, true)
    async findAllByVenue(@Param('venueId') venueId: string) {
        return this.courtsService.findAllByVenue(venueId);
    }

    @Post()
    @ApiOperation({ summary: 'Thêm sân nhỏ mới' })
    @ApiSuccessResponse(Court)
    async create(@CurrentUser('id') ownerId: string, @Body() data: any) {
        return this.courtsService.create(ownerId, data);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Cập nhật thông tin sân nhỏ' })
    @ApiSuccessResponse(Court)
    async update(@CurrentUser('id') ownerId: string, @Param('id') id: string, @Body() data: any) {
        return this.courtsService.update(ownerId, id, data);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa sân nhỏ' })
    @ApiSuccessResponse()
    async remove(@CurrentUser('id') ownerId: string, @Param('id') id: string) {
        return this.courtsService.softDelete(ownerId, id);
    }

    @Get(':id/pricing-rules')
    @ApiOperation({ summary: 'Lấy cấu hình giá của sân nhỏ' })
    @ApiSuccessResponse(Object, true)
    async getPricingRules(@Param('id') id: string) {
        return this.courtsService.getPricingRules(id);
    }

    @Put(':id/pricing-rules')
    @ApiOperation({ summary: 'Cập nhật cấu hình giá của sân nhỏ' })
    @ApiSuccessResponse()
    async updatePricingRules(@CurrentUser('id') ownerId: string, @Param('id') id: string, @Body() body: { rules: any[] }) {
        return this.courtsService.updatePricingRules(ownerId, id, body.rules);
    }
}
