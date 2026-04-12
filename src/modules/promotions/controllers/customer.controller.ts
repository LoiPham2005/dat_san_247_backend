import { Controller, Get, Post, Body, UseGuards, Req, Param } from '@nestjs/common';
import { PromotionsService } from '../promotions.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ResponseUtil } from '../../../common/utils/response.util';

@Controller('customer/promotions')
@UseGuards(JwtAuthGuard)
export class CustomerController {
    constructor(private readonly promotionsService: PromotionsService) {}

    @Get('vouchers')
    async getMyVouchers(@Req() req: any) {
        const result = await this.promotionsService.getMyVouchers(req.user.id);
        return ResponseUtil.success(result, 'Lấy danh sách voucher thành công');
    }

    @Post('collect/:id')
    async collectPromotion(@Req() req: any, @Param('id') id: string) {
        const result = await this.promotionsService.collectPromotion(req.user.id, id);
        return ResponseUtil.success(result, 'Lưu khuyến mãi thành công');
    }
}
