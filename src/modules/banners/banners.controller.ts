import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { BannerFilterDto } from './dto/banner-filter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Banners')
@Controller('banners')
export class BannersController {
  constructor(private bannersService: BannersService) { }

  // =====================================================
  // PUBLIC - Lấy banner hoạt động
  // =====================================================
  @Get('public/active')
  @Public()
  @ApiOperation({ summary: 'Lấy banner hoạt động' })
  async getActiveBanners(@Query() filters: BannerFilterDto) {
    const banners = await this.bannersService.findAllActiveBanners(filters);
    return {
      success: true,
      message: 'Banner hoạt động được lấy thành công',
      data: banners,
      total: banners.length,
    };
  }

  // =====================================================
  // PUBLIC - Lấy banner theo vị trí
  // =====================================================
  @Get('public/position/:position')
  @Public()
  @ApiOperation({ summary: 'Lấy banner theo vị trí' })
  async getByPosition(@Param('position') position: string) {
    const banners = await this.bannersService.getByPosition(position as any);
    return {
      success: true,
      message: 'Banner được lấy thành công',
      data: banners,
      total: banners.length,
    };
  }

  // =====================================================
  // PUBLIC - Ghi nhận view
  // =====================================================
  @Post('public/:id/view')
  @Public()
  @ApiOperation({ summary: 'Ghi nhận view banner' })
  async recordView(@Param('id') id: string, @Req() req: any) {
    await this.bannersService.recordView(
      id,
      req.user?.id,
      req.ip,
      req.headers['user-agent']
    );
    return {
      success: true,
      message: 'View được ghi nhận',
    };
  }

  // =====================================================
  // PUBLIC - Ghi nhận click
  // =====================================================
  @Post('public/:id/click')
  @Public()
  @ApiOperation({ summary: 'Ghi nhận click banner' })
  async recordClick(@Param('id') id: string, @Req() req: any) {
    await this.bannersService.recordClick(
      id,
      req.user?.id,
      req.ip,
      req.headers['user-agent']
    );
    return {
      success: true,
      message: 'Click được ghi nhận',
    };
  }

  // =====================================================
  // ADMIN - CREATE
  // =====================================================
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Tạo banner mới' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateBannerDto) {
    const banner = await this.bannersService.create(dto, userId);
    return {
      success: true,
      message: 'Banner được tạo thành công',
      data: banner,
    };
  }

  // =====================================================
  // ADMIN - READ ALL
  // =====================================================
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lấy tất cả banner' })
  async findAll(@Query() filters: BannerFilterDto) {
    const banners = await this.bannersService.findAll(filters);
    return {
      success: true,
      message: 'Banner được lấy thành công',
      data: banners,
      total: banners.length,
    };
  }

  // =====================================================
  // ADMIN - READ ONE
  // =====================================================
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lấy banner theo ID' })
  async findOne(@Param('id') id: string) {
    const banner = await this.bannersService.findOne(id);
    return {
      success: true,
      message: 'Banner được lấy thành công',
      data: banner,
    };
  }

  // =====================================================
  // ADMIN - UPDATE
  // =====================================================
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Cập nhật banner' })
  async update(@Param('id') id: string, @Body() dto: UpdateBannerDto) {
    const banner = await this.bannersService.update(id, dto);
    return {
      success: true,
      message: 'Banner được cập nhật thành công',
      data: banner,
    };
  }

  // =====================================================
  // ADMIN - Update Display Order
  // =====================================================
  @Put(':id/order/:order')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Cập nhật thứ tự hiển thị' })
  async updateDisplayOrder(@Param('id') id: string, @Param('order') order: string) {
    const banner = await this.bannersService.updateDisplayOrder(id, parseInt(order));
    return {
      success: true,
      message: 'Thứ tự hiển thị được cập nhật',
      data: banner,
    };
  }

  // =====================================================
  // ADMIN - Toggle Active
  // =====================================================
  @Put(':id/toggle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Bật/Tắt banner' })
  async toggleActive(@Param('id') id: string) {
    const banner = await this.bannersService.toggleActive(id);
    return {
      success: true,
      message: 'Trạng thái banner được thay đổi',
      data: banner,
    };
  }

  // =====================================================
  // ADMIN - Activate
  // =====================================================
  @Post(':id/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Kích hoạt banner' })
  async activate(@Param('id') id: string) {
    const banner = await this.bannersService.activate(id);
    return {
      success: true,
      message: 'Banner được kích hoạt',
      data: banner,
    };
  }

  // =====================================================
  // ADMIN - Deactivate
  // =====================================================
  @Post(':id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Vô hiệu hóa banner' })
  async deactivate(@Param('id') id: string) {
    const banner = await this.bannersService.deactivate(id);
    return {
      success: true,
      message: 'Banner được vô hiệu hóa',
      data: banner,
    };
  }

  // =====================================================
  // ADMIN - DELETE
  // =====================================================
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @HttpCode(204)
  @ApiOperation({ summary: 'Xóa banner' })
  async remove(@Param('id') id: string) {
    await this.bannersService.remove(id);
    return {
      success: true,
      message: 'Banner được xóa thành công',
    };
  }

  // =====================================================
  // ADMIN - Analytics
  // =====================================================
  @Get(':id/analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lấy analytics banner' })
  async getBannerAnalytics(
    @Param('id') id: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    const analytics = await this.bannersService.getBannerAnalytics(id, fromDate, toDate);
    return {
      success: true,
      message: 'Analytics được lấy thành công',
      data: analytics,
    };
  }

  // =====================================================
  // ADMIN - Position Analytics
  // =====================================================
  @Get('analytics/position/:position')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lấy analytics theo vị trí' })
  async getPositionAnalytics(@Param('position') position: string) {
    const analytics = await this.bannersService.getPositionAnalytics(position as any);
    return {
      success: true,
      message: 'Analytics được lấy thành công',
      data: analytics,
    };
  }

  // =====================================================
  // ADMIN - Statistics
  // =====================================================
  @Get('statistics/overview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lấy thống kê banner' })
  async getStatistics() {
    const stats = await this.bannersService.getStatistics();
    return {
      success: true,
      message: 'Thống kê được lấy thành công',
      data: stats,
    };
  }

  // =====================================================
  // ADMIN - Bulk Operations
  // =====================================================
  @Put('bulk/order')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Cập nhật thứ tự hàng loạt' })
  async updateBulkOrder(@Body() updates: { id: string; displayOrder: number }[]) {
    await this.bannersService.updateBulkOrder(updates);
    return {
      success: true,
      message: 'Thứ tự được cập nhật thành công',
    };
  }

  @Post('bulk/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Kích hoạt nhiều banner' })
  async bulkActivate(@Body() body: { ids: string[] }) {
    await this.bannersService.bulkActivate(body.ids);
    return {
      success: true,
      message: 'Banner được kích hoạt thành công',
    };
  }

  @Post('bulk/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Vô hiệu hóa nhiều banner' })
  async bulkDeactivate(@Body() body: { ids: string[] }) {
    await this.bannersService.bulkDeactivate(body.ids);
    return {
      success: true,
      message: 'Banner được vô hiệu hóa thành công',
    };
  }

  @Delete('bulk/delete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @HttpCode(204)
  @ApiOperation({ summary: 'Xóa nhiều banner' })
  async bulkDelete(@Body() body: { ids: string[] }) {
    await this.bannersService.bulkDelete(body.ids);
    return {
      success: true,
      message: 'Banner được xóa thành công',
    };
  }
}