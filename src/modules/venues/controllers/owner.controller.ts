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
@Roles(UserRole.OWNER, UserRole.SUPER_ADMIN, UserRole.VENUE_STAFF)
export class OwnerController {
    constructor(
        private venuesService: VenuesService,
        private dashboardService: DashboardService,
        private storageService: StorageService
    ) { }

    @Get('dashboard/stats')
    async getDashboardStats(@Req() req: any) {
        if (req.user.role === UserRole.VENUE_STAFF) {
            const stats = await this.dashboardService.getStaffDashboardStats(req.user.id);
            return ResponseUtil.success(stats, 'Thống kê cơ sở (Nhân viên)');
        }
        const stats = await this.dashboardService.getOwnerDashboardStats(req.user.id);
        return ResponseUtil.success(stats, 'Thống kê bảng điều khiển');
    }

    @Get('dashboard/staff-stats')
    async getStaffDashboardStatsForAnyRole(@Req() req: any) {
        // Luôn trả về dữ liệu kiểu Nhân viên (Staff View), dùng cho Staff Dashboard Page
        const stats = await this.dashboardService.getStaffDashboardStats(req.user.id);
        return ResponseUtil.success(stats, 'Thống kê cơ sở (Chi tiết)');
    }

    // SCHEDULE EXCEPTIONS (Moved up for precedence)
    @Get(':id/exceptions')
    async getScheduleExceptions(@Req() req: any, @Param('id') id: string) {
        const result = await this.venuesService.getScheduleExceptions(id, req.user.id);
        return ResponseUtil.success(result, 'Lấy danh sách ngày đặc biệt thành công');
    }

    @Post(':id/exceptions')
    async createScheduleException(@Req() req: any, @Param('id') id: string, @Body() body: any) {
        const result = await this.venuesService.createScheduleException(id, req.user.id, body);
        return ResponseUtil.created(result, 'Thêm ngày đặc biệt thành công');
    }

    @Delete(':id/exceptions/:exceptionId')
    async deleteScheduleException(@Req() req: any, @Param('id') id: string, @Param('exceptionId') exceptionId: string) {
        await this.venuesService.deleteScheduleException(id, exceptionId, req.user.id);
        return ResponseUtil.success(null, 'Đã xóa ngày đặc biệt');
    }

    // OPERATING HOURS
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

    @Get()
    async getMyVenues(@Req() req: any) {
        const venues = await this.venuesService.getMyVenues(req.user.id);
        return ResponseUtil.success(venues, 'Mạng lưới sân bãi của bạn');
    }

    @Get(':id')
    async getVenueDetail(@Req() req: any, @Param('id') id: string) {
        const venue = await this.venuesService.getVenueDetail(id, req.user.id);
        return ResponseUtil.success(venue, 'Chi tiết cơ sở');
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

    @Get(':id/amenities')
    async getVenueAmenities(@Req() req: any, @Param('id') id: string) {
        const result = await this.venuesService.getVenueAmenities(id, req.user.id);
        return ResponseUtil.success(result, 'Lấy danh sách tiện ích thành công');
    }

    @Post(':id/amenities')
    async createVenueAmenity(@Req() req: any, @Param('id') id: string, @Body() body: any) {
        const result = await this.venuesService.createVenueAmenity(id, req.user.id, body);
        return ResponseUtil.created(result, 'Thêm tiện ích thành công');
    }

    @Delete(':id/amenities/:amenityId')
    async deleteVenueAmenity(@Req() req: any, @Param('id') id: string, @Param('amenityId') amenityId: string) {
        await this.venuesService.deleteVenueAmenity(id, amenityId, req.user.id);
        return ResponseUtil.success(null, 'Đã xóa tiện ích');
    }

    @Patch(':id/amenities/:amenityId')
    async updateVenueAmenity(@Req() req: any, @Param('id') id: string, @Param('amenityId') amenityId: string, @Body() body: any) {
        const result = await this.venuesService.updateVenueAmenity(id, amenityId, req.user.id, body);
        return ResponseUtil.success(result, 'Cập nhật tiện ích thành công');
    }

    // MEDIA
    @Get(':id/media')
    async getMediaAttachments(@Req() req: any, @Param('id') id: string) {
        const result = await this.venuesService.getMediaAttachments(id, req.user.id);
        return ResponseUtil.success(result, 'Lấy danh sách ảnh venue thành công');
    }

    @Post(':id/media')
    async createMediaAttachment(@Req() req: any, @Param('id') id: string, @Body() body: any) {
        const result = await this.venuesService.createMediaAttachment(id, req.user.id, body);
        return ResponseUtil.created(result, 'Tải ảnh lên thành công');
    }

    @Delete(':id/media/:mediaId')
    async deleteMediaAttachment(@Req() req: any, @Param('id') id: string, @Param('mediaId') mediaId: string) {
        await this.venuesService.deleteMediaAttachment(id, mediaId, req.user.id);
        return ResponseUtil.success(null, 'Đã xóa ảnh venue');
    }

    @Patch(':id/media/:mediaId/cover')
    async setCoverMedia(@Req() req: any, @Param('id') id: string, @Param('mediaId') mediaId: string) {
        const result = await this.venuesService.setCoverMedia(id, mediaId, req.user.id);
        return ResponseUtil.success(result, 'Đã đặt làm ảnh bìa');
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

    // SERVICES
    @Get(':id/services')
    async getVenueServices(@Req() req: any, @Param('id') id: string) {
        const result = await this.venuesService.getVenueServices(id, req.user.id);
        return ResponseUtil.success(result, 'Lấy danh sách dịch vụ thành công');
    }

    @Post(':id/services')
    async createVenueService(@Req() req: any, @Param('id') id: string, @Body() body: any) {
        const result = await this.venuesService.createVenueService(id, req.user.id, body);
        return ResponseUtil.created(result, 'Thêm dịch vụ thành công');
    }

    @Patch(':id/services/:serviceId')
    async updateVenueService(@Req() req: any, @Param('id') id: string, @Param('serviceId') serviceId: string, @Body() body: any) {
        const result = await this.venuesService.updateVenueService(id, serviceId, req.user.id, body);
        return ResponseUtil.success(result, 'Cập nhật dịch vụ thành công');
    }

    @Delete(':id/services/:serviceId')
    async deleteVenueService(@Req() req: any, @Param('id') id: string, @Param('serviceId') serviceId: string) {
        await this.venuesService.deleteVenueService(id, serviceId, req.user.id);
        return ResponseUtil.success(null, 'Đã xóa dịch vụ');
    }
}
