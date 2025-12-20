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
import { AppVersionsService } from './app-version.service';
import { CreateAppVersionDto } from './dto/create-app-version.dto';
import { UpdateAppVersionDto } from './dto/update-app-version.dto';
import { AppVersionFilterDto } from './dto/app-version-filter.dto';
import { Platform } from './entities/app-version.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('App Versions')
@Controller('app-versions')
export class AppVersionsController {
  constructor(private appVersionsService: AppVersionsService) { }

  // =====================================================
  // PUBLIC - Kiểm tra cập nhật
  // =====================================================
  @Get('check-update')
  @Public()
  @ApiOperation({ summary: 'Check for app update' })
  async checkForUpdate(
    @Query('platform') platform: Platform,
    @Query('currentVersion') currentVersion: string,
  ) {
    const result = await this.appVersionsService.checkForUpdate(platform, currentVersion);
    return {
      success: true,
      message: 'Update check completed',
      data: result,
    };
  }

  // =====================================================
  // PUBLIC - Lấy phiên bản hiện tại
  // =====================================================
  @Get('current/:platform')
  @Public()
  @ApiOperation({ summary: 'Get current version by platform' })
  async getCurrentVersion(@Param('platform') platform: Platform) {
    const version = await this.appVersionsService.getCurrentVersion(platform);
    return {
      success: true,
      message: 'Current version retrieved successfully',
      data: version,
    };
  }

  // =====================================================
  // PUBLIC - Ghi nhận lượt tải
  // =====================================================
  @Post(':id/download')
  @Public()
  @ApiOperation({ summary: 'Record download' })
  async recordDownload(@Param('id') id: string) {
    const version = await this.appVersionsService.recordDownload(id);
    return {
      success: true,
      message: 'Download recorded successfully',
      data: version,
    };
  }

  // =====================================================
  // PUBLIC - Ghi nhận người dùng
  // =====================================================
  @Post(':id/user')
  @Public()
  @ApiOperation({ summary: 'Record user' })
  async recordUser(@Param('id') id: string) {
    const version = await this.appVersionsService.recordUser(id);
    return {
      success: true,
      message: 'User recorded successfully',
      data: version,
    };
  }

  // =====================================================
  // PUBLIC - Ghi nhận crash
  // =====================================================
  @Post(':id/crash')
  @Public()
  @ApiOperation({ summary: 'Record crash' })
  async recordCrash(@Param('id') id: string) {
    const version = await this.appVersionsService.recordCrash(id);
    return {
      success: true,
      message: 'Crash recorded successfully',
      data: version,
    };
  }

  // =====================================================
  // PUBLIC - Đánh giá phiên bản
  // =====================================================
  @Post(':id/rating')
  @Public()
  @ApiOperation({ summary: 'Rate app version' })
  async rateVersion(
    @Param('id') id: string,
    @Body() body: { rating: number },
  ) {
    const version = await this.appVersionsService.updateRating(id, body.rating);
    return {
      success: true,
      message: 'Rating recorded successfully',
      data: version,
    };
  }

  // =====================================================
  // PUBLIC - Lấy lịch sử phiên bản
  // =====================================================
  @Get('history/:platform')
  @Public()
  @ApiOperation({ summary: 'Get version history' })
  async getVersionHistory(
    @Param('platform') platform: Platform,
    @Query('limit') limit?: string,
  ) {
    const versions = await this.appVersionsService.getVersionHistory(
      platform,
      limit ? parseInt(limit) : 10,
    );
    return {
      success: true,
      message: 'Version history retrieved successfully',
      data: versions,
      total: versions.length,
    };
  }

  // =====================================================
  // ADMIN - CREATE
  // =====================================================
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create new app version' })
  async create(@Body() dto: CreateAppVersionDto) {
    const version = await this.appVersionsService.create(dto);
    return {
      success: true,
      message: 'App version created successfully',
      data: version,
    };
  }

  // =====================================================
  // ADMIN - READ ALL
  // =====================================================
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all app versions' })
  async findAll(@Query() filters: AppVersionFilterDto) {
    const versions = await this.appVersionsService.findAll(filters);
    return {
      success: true,
      message: 'App versions retrieved successfully',
      data: versions,
      total: versions.length,
    };
  }

  // =====================================================
  // ADMIN - READ ONE
  // =====================================================
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get app version by ID' })
  async findOne(@Param('id') id: string) {
    const version = await this.appVersionsService.findOne(id);
    return {
      success: true,
      message: 'App version retrieved successfully',
      data: version,
    };
  }

  // =====================================================
  // ADMIN - UPDATE
  // =====================================================
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update app version' })
  async update(@Param('id') id: string, @Body() dto: UpdateAppVersionDto) {
    const version = await this.appVersionsService.update(id, dto);
    return {
      success: true,
      message: 'App version updated successfully',
      data: version,
    };
  }

  // =====================================================
  // ADMIN - Toggle Active
  // =====================================================
  @Put(':id/toggle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Toggle app version active status' })
  async toggleActive(@Param('id') id: string) {
    const version = await this.appVersionsService.toggleActive(id);
    return {
      success: true,
      message: 'App version status toggled successfully',
      data: version,
    };
  }

  // =====================================================
  // ADMIN - Activate
  // =====================================================
  @Post(':id/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Activate app version' })
  async activate(@Param('id') id: string) {
    const version = await this.appVersionsService.activate(id);
    return {
      success: true,
      message: 'App version activated successfully',
      data: version,
    };
  }

  // =====================================================
  // ADMIN - Deactivate
  // =====================================================
  @Post(':id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Deactivate app version' })
  async deactivate(@Param('id') id: string) {
    const version = await this.appVersionsService.deactivate(id);
    return {
      success: true,
      message: 'App version deactivated successfully',
      data: version,
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
  @ApiOperation({ summary: 'Delete app version' })
  async remove(@Param('id') id: string) {
    await this.appVersionsService.remove(id);
    return {
      success: true,
      message: 'App version deleted successfully',
    };
  }

  // =====================================================
  // ADMIN - Statistics
  // =====================================================
  @Get('statistics/overview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get app version statistics' })
  async getStatistics() {
    const stats = await this.appVersionsService.getStatistics();
    return {
      success: true,
      message: 'Statistics retrieved successfully',
      data: stats,
    };
  }

  // =====================================================
  // ADMIN - Force Update Versions
  // =====================================================
  @Get('force-update/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get force update versions' })
  async getForceUpdateVersions() {
    const versions = await this.appVersionsService.getForceUpdateVersions();
    return {
      success: true,
      message: 'Force update versions retrieved successfully',
      data: versions,
      total: versions.length,
    };
  }

  // =====================================================
  // ADMIN - Latest by Platform
  // =====================================================
  @Get('latest/all-platforms')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get latest versions for all platforms' })
  async getLatestByPlatform() {
    const versions = await this.appVersionsService.getLatestVersionsByPlatform();
    const data = {};

    for (const [platform, version] of versions) {
      data[platform] = version;
    }

    return {
      success: true,
      message: 'Latest versions retrieved successfully',
      data,
    };
  }
}