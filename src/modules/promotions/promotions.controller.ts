import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiSuccessResponse } from '../../common/decorators/api-response.decorator';
import { Promotion } from './entities/promotion.entity';

@ApiTags('Client - Promotions')
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) { }

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả khuyến mãi (Public)' })
  @ApiSuccessResponse(Promotion, true)
  async getPromotions() {
    return this.promotionsService.findAll({ limit: 100 } as any);
  }

  @Get('banner')
  @ApiOperation({ summary: 'Lấy danh sách khuyến mãi hot (Home)' })
  @ApiSuccessResponse(Promotion, true)
  async getBanners() {
    return this.promotionsService.findHotPromotions();
  }

  @Get('my-vouchers')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Danh sách mã giảm giá của tôi' })
  @ApiSuccessResponse(Promotion, true)
  async getMyVouchers(@CurrentUser('id') userId: string) {
    return this.promotionsService.findUserPromotions(userId);
  }
}
