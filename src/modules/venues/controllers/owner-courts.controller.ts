import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { OwnerCourtService } from '../owner-courts.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/constants/role.constant';
import { ResponseUtil } from '../../../common/utils/response.util';

@Controller('owner/venues/:venueId/courts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.SUPER_ADMIN, UserRole.VENUE_STAFF, UserRole.STAFF)
export class OwnerCourtsController {
    constructor(private courtService: OwnerCourtService) { }

    @Get()
    async getCourts(@Req() req: any, @Param('venueId') venueId: string) {
        const courts = await this.courtService.getCourtsByVenue(venueId, req.user.id);
        return ResponseUtil.success(courts, 'Lấy danh sách sân thành công');
    }

    @Post()
    async createCourt(@Req() req: any, @Param('venueId') venueId: string, @Body() data: any) {
        const court = await this.courtService.createCourt(venueId, req.user.id, data);
        return ResponseUtil.created(court, 'Tạo Sân/Khu vực mới thành công');
    }

    @Patch(':courtId')
    async updateCourt(@Req() req: any, @Param('courtId') courtId: string, @Body() data: any) {
        const court = await this.courtService.updateCourt(courtId, req.user.id, data);
        return ResponseUtil.success(court, 'Cập nhật Sân thành công');
    }

    @Delete(':courtId')
    async deleteCourt(@Req() req: any, @Param('courtId') courtId: string) {
        await this.courtService.deleteCourt(courtId, req.user.id);
        return ResponseUtil.success(null, 'Đã xóa Sân');
    }

    // PRICING RULES
    @Get(':courtId/pricing-rules')
    async getPricingRules(@Req() req: any, @Param('courtId') courtId: string) {
        const rules = await this.courtService.getPricingRules(courtId, req.user.id);
        return ResponseUtil.success(rules, 'Danh sách Quy tắc giá');
    }

    @Post(':courtId/pricing-rules')
    async createPricingRule(@Req() req: any, @Param('courtId') courtId: string, @Body() data: any) {
        const rule = await this.courtService.createPricingRule(courtId, req.user.id, data);
        return ResponseUtil.created(rule, 'Tạo Quy tắc giá thành công');
    }

    @Delete(':courtId/pricing-rules/:id')
    async deletePricingRule(@Req() req: any, @Param('courtId') courtId: string, @Param('id') id: string) {
        await this.courtService.deletePricingRule(id, courtId, req.user.id);
        return ResponseUtil.success(null, 'Đã xóa quy tắc giá');
    }

    // MAINTENANCE
    @Get(':courtId/maintenances')
    async getMaintenances(@Req() req: any, @Param('courtId') courtId: string) {
        const items = await this.courtService.getMaintenances(courtId, req.user.id);
        return ResponseUtil.success(items, 'Danh sách bảo trì');
    }

    @Post(':courtId/maintenances')
    async createMaintenance(@Req() req: any, @Param('courtId') courtId: string, @Body() data: any) {
        const item = await this.courtService.createMaintenance(courtId, req.user.id, data);
        return ResponseUtil.created(item, 'Đăng ký Bảo trì thành công');
    }

    @Delete(':courtId/maintenances/:id')
    async deleteMaintenance(@Req() req: any, @Param('courtId') courtId: string, @Param('id') id: string) {
        await this.courtService.deleteMaintenance(id, courtId, req.user.id);
        return ResponseUtil.success(null, 'Đã hủy Lịch Bảo trì (Mở sân)');
    }

    // AMENITIES
    @Get(':courtId/amenities')
    async getAmenities(@Req() req: any, @Param('courtId') courtId: string) {
        const items = await this.courtService.getAmenities(courtId, req.user.id);
        return ResponseUtil.success(items, 'Danh sách tiện ích');
    }

    @Post(':courtId/amenities')
    async createAmenity(@Req() req: any, @Param('courtId') courtId: string, @Body() data: any) {
        const item = await this.courtService.createAmenity(courtId, req.user.id, data);
        return ResponseUtil.created(item, 'Thêm tiện ích thành công');
    }

    @Delete(':courtId/amenities/:id')
    async deleteAmenity(@Req() req: any, @Param('courtId') courtId: string, @Param('id') id: string) {
        await this.courtService.deleteAmenity(id, courtId, req.user.id);
        return ResponseUtil.success(null, 'Đã xóa tiện ích');
    }

    // SPORTS
    @Get(':courtId/sports')
    async getSports(@Req() req: any, @Param('courtId') courtId: string) {
        const items = await this.courtService.getSports(courtId, req.user.id);
        return ResponseUtil.success(items, 'Danh sách Môn thể thao');
    }

    @Post(':courtId/sports')
    async createSport(@Req() req: any, @Param('courtId') courtId: string, @Body() data: any) {
        const item = await this.courtService.createSport(courtId, req.user.id, data);
        return ResponseUtil.created(item, 'Thêm môn thể thao thành công');
    }

    @Delete(':courtId/sports/:id')
    async deleteSport(@Req() req: any, @Param('courtId') courtId: string, @Param('id') id: string) {
        await this.courtService.deleteSport(id, courtId, req.user.id);
        return ResponseUtil.success(null, 'Đã xóa Môn thể thao khỏi sân');
    }
}
