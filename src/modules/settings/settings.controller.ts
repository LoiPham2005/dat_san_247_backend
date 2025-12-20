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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { SettingFilterDto } from './dto/setting-filter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) { }

  // =====================================================
  // PUBLIC - Lấy public settings
  // =====================================================
  @Get('public')
  @Public()
  @ApiOperation({ summary: 'Get public settings' })
  async getPublicSettings() {
    const settings = await this.settingsService.getPublicSettings();
    return {
      success: true,
      message: 'Public settings retrieved successfully',
      data: settings,
    };
  }

  // =====================================================
  // PUBLIC - Lấy setting theo key
  // =====================================================
  @Get('public/key/:settingKey')
  @Public()
  @ApiOperation({ summary: 'Get setting by key' })
  async getSettingByKey(@Param('settingKey') settingKey: string) {
    const value = await this.settingsService.getByKey(settingKey);
    return {
      success: true,
      message: 'Setting retrieved successfully',
      data: value,
    };
  }

  // =====================================================
  // PUBLIC - Lấy settings theo category
  // =====================================================
  @Get('public/category/:category')
  @Public()
  @ApiOperation({ summary: 'Get settings by category' })
  async getSettingsByCategory(@Param('category') category: string) {
    const settings = await this.settingsService.getByCategory(category);
    return {
      success: true,
      message: 'Settings retrieved successfully',
      data: settings,
    };
  }

  // =====================================================
  // ADMIN - Tạo setting mới
  // =====================================================
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create new setting' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSettingDto
  ) {
    const setting = await this.settingsService.create(dto, userId);
    return {
      success: true,
      message: 'Setting created successfully',
      data: setting,
    };
  }

  // =====================================================
  // ADMIN - Lấy tất cả settings
  // =====================================================
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all settings' })
  async findAll(@Query() filters: SettingFilterDto) {
    const settings = await this.settingsService.findAll(filters);
    return {
      success: true,
      message: 'Settings retrieved successfully',
      data: settings,
      total: settings.length,
    };
  }

  // =====================================================
  // ADMIN - Lấy setting theo ID
  // =====================================================
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get setting by ID' })
  async findOne(@Param('id') id: string) {
    const setting = await this.settingsService.findOne(id);
    return {
      success: true,
      message: 'Setting retrieved successfully',
      data: setting,
    };
  }

  // =====================================================
  // ADMIN - Cập nhật setting
  // =====================================================
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update setting' })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateSettingDto
  ) {
    const setting = await this.settingsService.update(id, dto, userId);
    return {
      success: true,
      message: 'Setting updated successfully',
      data: setting,
    };
  }

  // =====================================================
  // ADMIN - Cập nhật setting theo key
  // =====================================================
  @Put('key/:settingKey')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update setting by key' })
  async updateByKey(
    @Param('settingKey') settingKey: string,
    @CurrentUser('id') userId: string,
    @Body() body: { settingValue: string }
  ) {
    const setting = await this.settingsService.updateByKey(
      settingKey,
      body.settingValue,
      userId
    );
    return {
      success: true,
      message: 'Setting updated successfully',
      data: setting,
    };
  }

  // =====================================================
  // ADMIN - Bulk update settings
  // =====================================================
  @Post('bulk/update')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Bulk update settings' })
  async bulkUpdate(
    @CurrentUser('id') userId: string,
    @Body() body: { updates: { settingKey: string; settingValue: string }[] }
  ) {
    await this.settingsService.bulkUpdate(body.updates, userId);
    return {
      success: true,
      message: 'Settings updated successfully',
    };
  }

  // =====================================================
  // ADMIN - Xóa setting
  // =====================================================
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete setting' })
  async remove(@Param('id') id: string) {
    await this.settingsService.remove(id);
    return {
      success: true,
      message: 'Setting deleted successfully',
    };
  }

  // =====================================================
  // ADMIN - Xóa settings theo category
  // =====================================================
  @Delete('category/:category')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete settings by category' })
  async removeByCategory(@Param('category') category: string) {
    await this.settingsService.removeByCategory(category);
    return {
      success: true,
      message: 'Settings deleted successfully',
    };
  }

  // =====================================================
  // ADMIN - Mail settings
  // =====================================================
  @Get('mail/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get mail settings' })
  async getMailSettings() {
    const settings = await this.settingsService.getMailSettings();
    return {
      success: true,
      message: 'Mail settings retrieved successfully',
      data: settings,
    };
  }

  @Put('mail/update')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update mail settings' })
  async updateMailSettings(
    @CurrentUser('id') userId: string,
    @Body() mailSettings: any
  ) {
    await this.settingsService.setMailSettings(mailSettings, userId);
    return {
      success: true,
      message: 'Mail settings updated successfully',
    };
  }

  // =====================================================
  // ADMIN - Payment settings
  // =====================================================
  @Get('payment/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get payment settings' })
  async getPaymentSettings() {
    const settings = await this.settingsService.getPaymentSettings();
    return {
      success: true,
      message: 'Payment settings retrieved successfully',
      data: settings,
    };
  }

  @Put('payment/update')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update payment settings' })
  async updatePaymentSettings(
    @CurrentUser('id') userId: string,
    @Body() paymentSettings: any
  ) {
    await this.settingsService.setPaymentSettings(paymentSettings, userId);
    return {
      success: true,
      message: 'Payment settings updated successfully',
    };
  }

  // =====================================================
  // ADMIN - Commission settings
  // =====================================================
  @Get('commission/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get commission settings' })
  async getCommissionSettings() {
    const settings = await this.settingsService.getCommissionSettings();
    return {
      success: true,
      message: 'Commission settings retrieved successfully',
      data: settings,
    };
  }

  @Put('commission/update')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update commission settings' })
  async updateCommissionSettings(
    @CurrentUser('id') userId: string,
    @Body() commissionSettings: any
  ) {
    await this.settingsService.setCommissionSettings(commissionSettings, userId);
    return {
      success: true,
      message: 'Commission settings updated successfully',
    };
  }

  // =====================================================
  // ADMIN - Booking settings
  // =====================================================
  @Get('booking/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get booking settings' })
  async getBookingSettings() {
    const settings = await this.settingsService.getBookingSettings();
    return {
      success: true,
      message: 'Booking settings retrieved successfully',
      data: settings,
    };
  }

  @Put('booking/update')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update booking settings' })
  async updateBookingSettings(
    @CurrentUser('id') userId: string,
    @Body() bookingSettings: any
  ) {
    await this.settingsService.setBookingSettings(bookingSettings, userId);
    return {
      success: true,
      message: 'Booking settings updated successfully',
    };
  }

  // =====================================================
  // ADMIN - Security settings
  // =====================================================
  @Get('security/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get security settings' })
  async getSecuritySettings() {
    const settings = await this.settingsService.getSecuritySettings();
    return {
      success: true,
      message: 'Security settings retrieved successfully',
      data: settings,
    };
  }

  @Put('security/update')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update security settings' })
  async updateSecuritySettings(
    @CurrentUser('id') userId: string,
    @Body() securitySettings: any
  ) {
    await this.settingsService.setSecuritySettings(securitySettings, userId);
    return {
      success: true,
      message: 'Security settings updated successfully',
    };
  }

  // =====================================================
  // ADMIN - Statistics
  // =====================================================
  @Get('statistics/overview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get settings statistics' })
  async getStatistics() {
    const stats = await this.settingsService.getStatistics();
    return {
      success: true,
      message: 'Statistics retrieved successfully',
      data: stats,
    };
  }

  // =====================================================
  // ADMIN - Export settings
  // =====================================================
  @Post('export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Export all settings' })
  async exportSettings() {
    const settings = await this.settingsService.exportSettings();
    return {
      success: true,
      message: 'Settings exported successfully',
      data: settings,
    };
  }

  // =====================================================
  // ADMIN - Import settings
  // =====================================================
  @Post('import')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Import settings' })
  async importSettings(
    @CurrentUser('id') userId: string,
    @Body() body: { settings: any[] }
  ) {
    await this.settingsService.importSettings(body.settings, userId);
    return {
      success: true,
      message: 'Settings imported successfully',
    };
  }
}