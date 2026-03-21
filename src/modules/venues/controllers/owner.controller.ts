import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req, HttpStatus, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VenuesService } from '../venues.service';
import { DashboardService } from '../dashboard.service';
import { CreateVenueDto } from '../dto/create-venue.dto';
import { UpdateVenueDto } from '../dto/update-venue.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/constants/role.constant';
import { ResponseUtil } from '../../../common/utils/response.util';
import { StorageService } from '../../../shared/storage/storage.service';

@Controller('owner/venues')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.SUPER_ADMIN)
export class OwnerController {
    constructor(
        private venuesService: VenuesService,
        private dashboardService: DashboardService,
        private storageService: StorageService
    ) { }

    @Get('dashboard/stats')
    async getDashboardStats(@Req() req: any) {
        const stats = await this.dashboardService.getOwnerDashboardStats(req.user.id);
        return ResponseUtil.success(stats, 'Thống kê bảng điều khiển');
    }

    @Get()
    async getMyVenues(@Req() req: any) {
        const venues = await this.venuesService.getMyVenues(req.user.id);
        return ResponseUtil.success(venues, 'Mạng lưới sân bãi của bạn');
    }

    @Post()
    async createVenue(@Req() req: any, @Body() dto: CreateVenueDto) {
        const venue = await this.venuesService.createVenue(req.user.id, dto);
        return ResponseUtil.created(venue, 'Khởi tạo Cơ sở thành công');
    }

    @Patch(':id')
    async updateVenue(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateVenueDto) {
        const venue = await this.venuesService.updateVenue(id, req.user.id, dto);
        return ResponseUtil.success(venue, 'Cập nhật thông tin thành công');
    }

    @Delete(':id')
    async deleteVenue(@Req() req: any, @Param('id') id: string) {
        await this.venuesService.deleteVenue(id, req.user.id);
        return ResponseUtil.success(null, 'Đã xóa cơ sở thành công');
    }

    @Get(':id/verification')
    async getVerification(@Req() req: any, @Param('id') id: string) {
        const verification = await this.venuesService.getVerification(id, req.user.id);
        return ResponseUtil.success(verification, 'Hồ sơ pháp lý của cơ sở');
    }

    @Post(':id/verification')
    async submitVerification(@Req() req: any, @Param('id') id: string, @Body() dto: any) {
        const verification = await this.venuesService.submitVerification(id, req.user.id, dto);
        return ResponseUtil.created(verification, 'Đã gửi hồ sơ xét duyệt');
    }

    @Get(':id/operating-hours')
    async getOperatingHours(@Req() req: any, @Param('id') id: string) {
        const hours = await this.venuesService.getOperatingHours(id, req.user.id);
        return ResponseUtil.success(hours, 'Giờ hoạt động của cơ sở');
    }

    @Patch(':id/operating-hours')
    async updateOperatingHours(@Req() req: any, @Param('id') id: string, @Body() body: { hours: any[] }) {
        const result = await this.venuesService.updateOperatingHours(id, req.user.id, body.hours);
        return ResponseUtil.success(result, 'Cập nhật lịch hoạt động thành công');
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: any) {
        if (!file) {
            throw new BadRequestException('Không tìm thấy tệp đính kèm');
        }
        const url = await this.storageService.upload(file, 'verifications');
        return ResponseUtil.success({ url }, 'Đã tải lên tệp thành công');
    }
}
