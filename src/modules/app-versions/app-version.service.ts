import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan } from 'typeorm';
import { AppVersion, Platform } from './entities/app-version.entity';
import { CreateAppVersionDto } from './dto/create-app-version.dto';
import { UpdateAppVersionDto } from './dto/update-app-version.dto';
import { AppVersionFilterDto } from './dto/app-version-filter.dto';

@Injectable()
export class AppVersionsService {
  private readonly logger = new Logger(AppVersionsService.name);

  constructor(
    @InjectRepository(AppVersion)
    private appVersionRepository: Repository<AppVersion>,
  ) {}

  // =====================================================
  // CREATE - Tạo phiên bản ứng dụng mới
  // =====================================================
  async create(dto: CreateAppVersionDto): Promise<AppVersion> {
    this.logger.log(`Creating new app version: ${dto.platform} v${dto.versionNumber}`);

    // Kiểm tra version đã tồn tại
    const existing = await this.appVersionRepository.findOne({
      where: {
        platform: dto.platform,
        versionNumber: dto.versionNumber,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Version ${dto.versionNumber} already exists for ${dto.platform}`
      );
    }

    const appVersion = this.appVersionRepository.create({
      ...dto,
      releasedAt: new Date(),
    });

    return this.appVersionRepository.save(appVersion);
  }

  // =====================================================
  // READ - Lấy tất cả phiên bản
  // =====================================================
  async findAll(filters?: AppVersionFilterDto): Promise<AppVersion[]> {
    const query = this.appVersionRepository
      .createQueryBuilder('version')
      .orderBy('version.releasedAt', 'DESC');

    if (filters?.platform) {
      query.andWhere('version.platform = :platform', { platform: filters.platform });
    }

    if (filters?.isActive !== undefined) {
      query.andWhere('version.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters?.isForceUpdate !== undefined) {
      query.andWhere('version.isForceUpdate = :isForceUpdate', {
        isForceUpdate: filters.isForceUpdate,
      });
    }

    return query.getMany();
  }

  // =====================================================
  // READ - Lấy phiên bản theo ID
  // =====================================================
  async findOne(id: string): Promise<AppVersion> {
    const appVersion = await this.appVersionRepository.findOne({
      where: { id },
    });

    if (!appVersion) {
      throw new NotFoundException(`App version with ID ${id} not found`);
    }

    return appVersion;
  }

  // =====================================================
  // READ - Lấy phiên bản hiện tại theo platform
  // =====================================================
  async getCurrentVersion(platform: Platform): Promise<AppVersion | null> {
    return this.appVersionRepository.findOne({
      where: {
        platform,
        isActive: true,
      },
      order: {
        releasedAt: 'DESC',
      },
    });
  }

  // =====================================================
  // READ - Kiểm tra cập nhật
  // =====================================================
  async checkForUpdate(
    platform: Platform,
    currentVersion: string,
  ): Promise<{ needsUpdate: boolean; isForceUpdate: boolean; version: AppVersion | null }> {
    const latestVersion = await this.getCurrentVersion(platform);

    if (!latestVersion) {
      return {
        needsUpdate: false,
        isForceUpdate: false,
        version: null,
      };
    }

    const needsUpdate = this.compareVersions(currentVersion, latestVersion.versionNumber) < 0;

    return {
      needsUpdate,
      isForceUpdate: needsUpdate && latestVersion.isForceUpdate,
      version: needsUpdate ? latestVersion : null,
    };
  }

  // =====================================================
  // READ - Lấy tất cả phiên bản theo platform
  // =====================================================
  async getByPlatform(platform: Platform): Promise<AppVersion[]> {
    return this.appVersionRepository.find({
      where: { platform },
      order: { releasedAt: 'DESC' },
    });
  }

  // =====================================================
  // READ - Lấy phiên bản cần cập nhật bắt buộc
  // =====================================================
  async getForceUpdateVersions(): Promise<AppVersion[]> {
    return this.appVersionRepository.find({
      where: {
        isForceUpdate: true,
        isActive: true,
      },
      order: { releasedAt: 'DESC' },
    });
  }

  // =====================================================
  // UPDATE - Cập nhật phiên bản
  // =====================================================
  async update(id: string, dto: UpdateAppVersionDto): Promise<AppVersion> {
    const appVersion = await this.findOne(id);

    // Kiểm tra version số nếu thay đổi
    if (dto.versionNumber && dto.versionNumber !== appVersion.versionNumber) {
      const existing = await this.appVersionRepository.findOne({
        where: {
          platform: appVersion.platform,
          versionNumber: dto.versionNumber,
        },
      });

      if (existing && existing.id !== id) {
        throw new BadRequestException(
          `Version ${dto.versionNumber} already exists for ${appVersion.platform}`
        );
      }
    }

    Object.assign(appVersion, dto);
    return this.appVersionRepository.save(appVersion);
  }

  // =====================================================
  // UPDATE - Bật/Tắt phiên bản
  // =====================================================
  async toggleActive(id: string): Promise<AppVersion> {
    const appVersion = await this.findOne(id);
    appVersion.isActive = !appVersion.isActive;
    return this.appVersionRepository.save(appVersion);
  }

  // =====================================================
  // UPDATE - Kích hoạt phiên bản
  // =====================================================
  async activate(id: string): Promise<AppVersion> {
    const appVersion = await this.findOne(id);
    appVersion.isActive = true;
    return this.appVersionRepository.save(appVersion);
  }

  // =====================================================
  // UPDATE - Vô hiệu hóa phiên bản
  // =====================================================
  async deactivate(id: string): Promise<AppVersion> {
    const appVersion = await this.findOne(id);
    appVersion.isActive = false;
    return this.appVersionRepository.save(appVersion);
  }

  // =====================================================
  // UPDATE - Ghi nhận lượt tải
  // =====================================================
  async recordDownload(id: string): Promise<AppVersion> {
    const appVersion = await this.findOne(id);
    appVersion.downloadCount += 1;
    return this.appVersionRepository.save(appVersion);
  }

  // =====================================================
  // UPDATE - Ghi nhận người dùng
  // =====================================================
  async recordUser(id: string): Promise<AppVersion> {
    const appVersion = await this.findOne(id);
    appVersion.userCount += 1;
    return this.appVersionRepository.save(appVersion);
  }

  // =====================================================
  // UPDATE - Ghi nhận crash
  // =====================================================
  async recordCrash(id: string): Promise<AppVersion> {
    const appVersion = await this.findOne(id);
    appVersion.crashCount += 1;
    return this.appVersionRepository.save(appVersion);
  }

  // =====================================================
  // UPDATE - Cập nhật rating
  // =====================================================
  async updateRating(id: string, rating: number): Promise<AppVersion> {
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const appVersion = await this.findOne(id);

    // Tính trung bình rating
    const totalRatings = appVersion.totalRatings || 0;
    const currentRating = appVersion.rating || 0;

    const newRating =
      (currentRating * totalRatings + rating) / (totalRatings + 1);

    appVersion.rating = parseFloat(newRating.toFixed(2));
    appVersion.totalRatings = totalRatings + 1;

    return this.appVersionRepository.save(appVersion);
  }

  // =====================================================
  // DELETE - Xóa phiên bản
  // =====================================================
  async remove(id: string): Promise<void> {
    const appVersion = await this.findOne(id);
    await this.appVersionRepository.remove(appVersion);
  }

  // =====================================================
  // STATISTICS - Thống kê phiên bản
  // =====================================================
  async getStatistics(): Promise<any> {
    const total = await this.appVersionRepository.count();
    const active = await this.appVersionRepository.count({ where: { isActive: true } });
    const forceUpdate = await this.appVersionRepository.count({ where: { isForceUpdate: true } });

    const byPlatform = await this.appVersionRepository
      .createQueryBuilder('version')
      .select('version.platform', 'platform')
      .addSelect('COUNT(*)', 'count')
      .addSelect('MAX(version.releasedAt)', 'latestRelease')
      .groupBy('version.platform')
      .getRawMany();

    const totalDownloads = await this.appVersionRepository
      .createQueryBuilder('version')
      .select('SUM(version.downloadCount)', 'total')
      .getRawOne();

    const totalUsers = await this.appVersionRepository
      .createQueryBuilder('version')
      .select('SUM(version.userCount)', 'total')
      .getRawOne();

    const totalCrashes = await this.appVersionRepository
      .createQueryBuilder('version')
      .select('SUM(version.crashCount)', 'total')
      .getRawOne();

    const averageRating = await this.appVersionRepository
      .createQueryBuilder('version')
      .select('AVG(version.rating)', 'average')
      .where('version.rating IS NOT NULL')
      .getRawOne();

    return {
      total,
      active,
      inactive: total - active,
      forceUpdate,
      byPlatform: byPlatform.map((p) => ({
        platform: p.platform,
        count: parseInt(p.count),
        latestRelease: p.latestRelease,
      })),
      totalDownloads: parseInt(totalDownloads.total || 0),
      totalUsers: parseInt(totalUsers.total || 0),
      totalCrashes: parseInt(totalCrashes.total || 0),
      averageRating: parseFloat(averageRating.average || 0).toFixed(2),
    };
  }

  // =====================================================
  // UTILITIES - Helper methods
  // =====================================================

  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;

      if (part1 > part2) return 1;
      if (part1 < part2) return -1;
    }

    return 0;
  }

  async getVersionHistory(
    platform: Platform,
    limit: number = 10,
  ): Promise<AppVersion[]> {
    return this.appVersionRepository.find({
      where: { platform },
      order: { releasedAt: 'DESC' },
      take: limit,
    });
  }

  async getLatestVersionsByPlatform(): Promise<Map<Platform, AppVersion>> {
    const result = new Map<Platform, AppVersion>();

    for (const platform of Object.values(Platform)) {
      const version = await this.getCurrentVersion(platform);
      if (version) {
        result.set(platform, version);
      }
    }

    return result;
  }
}