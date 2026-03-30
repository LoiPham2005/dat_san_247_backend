import { Controller, Get, Query } from '@nestjs/common';
import { PromotionsService } from '../promotions.service';
import { ResponseUtil } from '../../../common/utils/response.util';
import { Public } from '../../../common/decorators/public.decorator';

@Controller('public/promotions')
export class PublicController {
    constructor(private readonly promotionsService: PromotionsService) {}

    @Public()
    @Get()
    async getPublicPromotions(@Query() query: any) {
        const result = await this.promotionsService.getPublicPromotions(query);
        return ResponseUtil.paginated(
            result.data,
            result.meta.total,
            result.meta.page,
            result.meta.limit,
            'Promotions retrieved successfully'
        );
    }
}
