import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { UserRole } from '../../../../common/constants/role.constant';
import { BannerService } from '../banner.service';
import { ContentService } from '../content.service';

@Controller('admin/content')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminController {
    constructor(
        private bannerService: BannerService,
        private contentService: ContentService
    ) {}

    // --- BANNERS ---

    @Get('banners')
    getBanners() {
        return this.bannerService.getAllBanners();
    }

    @Patch('banners/:id/active')
    toggleActiveBanner(@Param('id') id: string, @Body('is_active') is_active: boolean) {
        return this.bannerService.toggleActive(id, is_active);
    }

    @Post('banners')
    createBanner(@Body() data: any) {
        return this.bannerService.createBanner(data);
    }

    @Patch('banners/:id')
    updateBanner(@Param('id') id: string, @Body() data: any) {
        return this.bannerService.updateBanner(id, data);
    }

    @Delete('banners/:id')
    deleteBanner(@Param('id') id: string) {
        return this.bannerService.deleteBanner(id);
    }

    // --- POLICIES ---

    @Get('policies')
    getPolicies() {
        return this.contentService.getAllPolicies();
    }

    @Post('policies')
    upsertPolicy(@Body() data: any, @Req() req: any) {
        return this.contentService.upsertPolicy(data, req.user.id);
    }

    // --- FAQS ---

    @Get('faqs')
    getFaqs() {
        return this.contentService.getAllFaqs();
    }

    @Post('faqs')
    createFaq(@Body() data: any, @Req() req: any) {
        return this.contentService.createFaq(data, req.user.id);
    }

    @Patch('faqs/:id')
    updateFaq(@Param('id') id: string, @Body() data: any) {
        return this.contentService.updateFaq(id, data);
    }

    @Delete('faqs/:id')
    deleteFaq(@Param('id') id: string) {
        return this.contentService.deleteFaq(id);
    }
}
