import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { VenuesAdminService } from '../venues-admin.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/constants/role.constant';
import { ResponseUtil } from '../../../common/utils/response.util';

@Controller('admin/venues')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER)
export class AdminController {
    constructor(private venuesAdminService: VenuesAdminService) { }

    @Get()
    async getVenues() {
        const venues = await this.venuesAdminService.getVenues();
        return ResponseUtil.success(venues, 'Danh sách venues thành công');
    }

    @Get(':id')
    async getVenueDetail(@Param('id') id: string) {
        const venue = await this.venuesAdminService.getVenueDetail(id);
        return ResponseUtil.success(venue, 'Chi tiết venue thành công');
    }

    @Patch(':id/status')
    async updateStatus(@Param('id') id: string, @Body() body: { status: any }) {
        const venue = await this.venuesAdminService.updateStatus(id, body.status);
        return ResponseUtil.success(venue, 'Cập nhật trạng thái thành công');
    }

    @Patch(':id/featured')
    async updateFeatured(@Param('id') id: string, @Body() body: { is_featured: boolean }) {
        const venue = await this.venuesAdminService.updateFeatured(id, body.is_featured);
        return ResponseUtil.success(venue, 'Cập nhật tính năng nổi bật thành công');
    }

    @Patch(':id/commission')
    @Roles(UserRole.SUPER_ADMIN, UserRole.OWNER)
    async updateCommissionRate(@Param('id') id: string, @Body() body: { rate: number }) {
        const venue = await this.venuesAdminService.updateCommissionRate(id, body.rate);
        return ResponseUtil.success(venue, 'Cập nhật chiết khấu thành công');
    }

    @Patch(':id/notes')
    async updateAdminNotes(@Param('id') id: string, @Body() body: { notes: string }) {
        const venue = await this.venuesAdminService.updateAdminNotes(id, body.notes);
        return ResponseUtil.success(venue, 'Cập nhật ghi chú thành công');
    }
}
