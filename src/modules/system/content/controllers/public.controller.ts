import { Controller, Get, Query } from '@nestjs/common';
import { BannerService } from '../banner.service';
import { ResponseUtil } from '../../../../common/utils/response.util';
import { Public } from '../../../../common/decorators/public.decorator';

@Controller('public/content')
export class PublicController {
    constructor(private bannerService: BannerService) {}

    @Public()
    @Get('banners')
    async getBanners(@Query('position') position?: string, @Query('page') page?: string) {
        const banners = await this.bannerService.getPublicBanners(position, page);
        return ResponseUtil.success(banners, 'Banners retrieved successfully');
    }
}
