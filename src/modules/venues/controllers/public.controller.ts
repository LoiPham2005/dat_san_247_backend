import { Controller, Get, Query, Param, UseGuards, Req, Post, Delete, Body } from '@nestjs/common';
import { VenuesQueryService } from '../venues-query.service';
import { OptionalJwtAuthGuard } from '../../../common/guards/optional-jwt-auth.guard';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ResponseUtil } from '../../../common/utils/response.util';

@Controller('public/venues')
export class PublicController {
    constructor(private readonly venuesQueryService: VenuesQueryService) { }

    @UseGuards(OptionalJwtAuthGuard)
    @Get()
    async searchVenues(@Req() req: any, @Query() params: any) {
        const userId = req.user?.id;
        const venues = await this.venuesQueryService.searchVenues(params, userId);
        return ResponseUtil.success(venues, 'Tìm kiếm sân thành công');
    }

    @Get('detail/:slug')
    async getVenueDetail(@Param('slug') slug: string) {
        const venue = await this.venuesQueryService.getVenueDetail(slug);
        return ResponseUtil.success(venue, 'Chi tiết sân');
    }

    @Get(':slug/schedule')
    async getVenueSchedule(@Param('slug') slug: string, @Query('date') date: string) {
        if (!date) {
            date = new Date().toISOString().split('T')[0];
        }
        const schedule = await this.venuesQueryService.getVenueSchedule(slug, date);
        return ResponseUtil.success(schedule, 'Lịch sân');
    }

    // -- Các phần yêu cầu đăng nhập đối với Khách --

    @UseGuards(JwtAuthGuard)
    @Get('me/favorites')
    async getFavorites(@Req() req: any) {
        const favorites = await this.venuesQueryService.getFavorites(req.user.id);
        return ResponseUtil.success(favorites, 'Danh sách yêu thích');
    }

    @UseGuards(JwtAuthGuard)
    @Post('me/favorites')
    async toggleFavorite(@Req() req: any, @Body('venue_id') venueId: string) {
        const isAdded = await this.venuesQueryService.toggleFavorite(req.user.id, venueId);
        return ResponseUtil.success(isAdded, isAdded ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích');
    }

    @UseGuards(JwtAuthGuard)
    @Get('me/search-history')
    async getSearchHistory(@Req() req: any) {
        const history = await this.venuesQueryService.getSearchHistory(req.user.id);
        return ResponseUtil.success(history, 'Lịch sử tìm kiếm');
    }

    @UseGuards(JwtAuthGuard)
    @Delete('me/search-history')
    async clearSearchHistory(@Req() req: any) {
        await this.venuesQueryService.clearSearchHistory(req.user.id);
        return ResponseUtil.success(true, 'Đã xóa toàn bộ lịch sử');
    }

    @UseGuards(JwtAuthGuard)
    @Post('me/search-history')
    async saveSearchHistory(@Req() req: any, @Body() body: { keyword: string; sport_type?: string }) {
        await this.venuesQueryService.saveSearchHistory(req.user.id, body.keyword, body.sport_type);
        return ResponseUtil.success(true, 'Đã lưu lịch sử');
    }
}
