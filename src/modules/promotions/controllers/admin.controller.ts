
import { Controller, Get, Post, Patch, Delete, Body, Query, Param, UseGuards, Req } from '@nestjs/common';
import { PromotionsService } from '../promotions.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/constants/role.constant';
import { PromotionStatus } from '@prisma/client';

@Controller('admin/promotions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminPromotionsController {
    constructor(private readonly promotionsService: PromotionsService) { }

    @Get()
    getPromotions(@Query() query: any) {
        return this.promotionsService.getPromotions(query);
    }

    @Post()
    create(@Req() req: any, @Body() data: any) {
        return this.promotionsService.adminCreatePromotion(req.user.id, data);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() data: any) {
        return this.promotionsService.adminUpdatePromotion(id, data);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.promotionsService.adminDeletePromotion(id);
    }

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body('status') status: PromotionStatus) {
        return this.promotionsService.adminToggleStatus(id, status);
    }
}
