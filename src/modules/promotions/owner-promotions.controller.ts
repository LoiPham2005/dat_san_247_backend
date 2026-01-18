import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/role.constant';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PromotionFilterDto } from './dto/promotion-filter.dto';
import { ApiSuccessResponse, ApiPaginatedResponse } from '../../common/decorators/api-response.decorator';
import { Promotion } from './entities/promotion.entity';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Owner - Promotions')
@ApiBearerAuth()
@Roles(UserRole.OWNER)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('owner/promotions')
export class OwnerPromotionsController {
    constructor(private readonly promotionsService: PromotionsService) { }

    @Get()
    @ApiOperation({ summary: 'Danh sách khuyến mãi của chủ sân' })
    @ApiPaginatedResponse(Promotion)
    async findAll(@CurrentUser('id') ownerId: string, @Query() filter: PromotionFilterDto) {
        return this.promotionsService.findAllByOwner(ownerId, filter);
    }

    @Post()
    @ApiOperation({ summary: 'Tạo khuyến mãi mới cho sân của mình' })
    @ApiSuccessResponse()
    async create(@CurrentUser('id') ownerId: string, @Body() data: any) {
        return this.promotionsService.createByOwner(ownerId, data);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa khuyến mãi' })
    @ApiSuccessResponse()
    async remove(@CurrentUser('id') ownerId: string, @Param('id') id: string) {
        return this.promotionsService.softDeleteByOwner(ownerId, id);
    }
}
