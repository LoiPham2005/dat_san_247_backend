
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { PromotionsService } from '../promotions.service';
import { CreatePromotionDto } from '../dto/create-promotion.dto';
import { UpdatePromotionDto } from '../dto/update-promotion.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ResponseUtil } from '../../../common/utils/response.util';

@Controller('owner/promotions')
@UseGuards(JwtAuthGuard)
export class OwnerController {
    constructor(private readonly promotionsService: PromotionsService) {}

    @Get('venue/:venueId')
    async getVenuePromotions(@Req() req: any, @Param('venueId') venueId: string) {
        const promos = await this.promotionsService.getOwnerPromotions(req.user.id, venueId);
        return ResponseUtil.success(promos);
    }

    @Get(':id/usage')
    async getPromotionUsage(@Req() req: any, @Param('id') id: string) {
        const usage = await this.promotionsService.getPromotionUsage(req.user.id, id);
        return ResponseUtil.success(usage);
    }

    @Post()
    async createPromotion(@Req() req: any, @Body() data: CreatePromotionDto) {
        const result = await this.promotionsService.createPromotion(req.user.id, data);
        return ResponseUtil.success(result, 'Đã tạo chương trình khuyến mãi thành công!');
    }

    @Patch(':id')
    async updatePromotion(@Req() req: any, @Param('id') id: string, @Body() data: UpdatePromotionDto) {
        const result = await this.promotionsService.updatePromotion(req.user.id, id, data);
        return ResponseUtil.success(result, 'Đã cập nhật khuyến mãi thành công!');
    }

    @Patch(':id/toggle')
    async toggleStatus(@Req() req: any, @Param('id') id: string) {
        const result = await this.promotionsService.toggleStatus(req.user.id, id);
        return ResponseUtil.success(result, 'Đã thay đổi trạng thái khuyến mãi!');
    }

    @Delete(':id')
    async deletePromotion(@Req() req: any, @Param('id') id: string) {
        await this.promotionsService.deletePromotion(req.user.id, id);
        return ResponseUtil.success(null, 'Đã xóa khuyến mãi thành công!');
    }
}
