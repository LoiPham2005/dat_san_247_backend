import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Banner, BannerPosition, TargetType } from './entities/banner.entity';
import { BannerAnalytics } from './entities/banner-analytics';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { BannerFilterDto } from './dto/banner-filter.dto';

@Injectable()
export class BannersService {
  private readonly logger = new Logger(BannersService.name);

  constructor(
    @InjectRepository(Banner)
    private bannerRepository: Repository<Banner>,
    @InjectRepository(BannerAnalytics)
    private analyticsRepository: Repository<BannerAnalytics>,
  ) { }

  // =====================================================
  // CREATE - Tạo banner mới
  // =====================================================
  async create(dto: CreateBannerDto, userId: string): Promise<Banner> {
    this.logger.log(`Creating banner: ${dto.title}`);

    const banner = this.bannerRepository.create({
      ...dto,
      targetType: dto.targetType as TargetType,
      position: dto.position as BannerPosition,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      createdBy: userId,
    });

    return this.bannerRepository.save(banner);
  }

  // =====================================================
  // READ - Lấy tất cả banner
  // =====================================================
  async findAll(filters?: BannerFilterDto): Promise<Banner[]> {
    const query = this.bannerRepository
      .createQueryBuilder('banner')
      .leftJoinAndSelect('banner.creator', 'creator')
      .orderBy('banner.displayOrder', 'ASC')
      .addOrderBy('banner.createdAt', 'DESC');

    if (filters?.position) {
      query.andWhere('banner.position = :position', { position: filters.position });
    }

    if (filters?.targetType) {
      query.andWhere('banner.targetType = :targetType', { targetType: filters.targetType });
    }

    if (filters?.isActive !== undefined) {
      query.andWhere('banner.isActive = :isActive', { isActive: filters.isActive });
    }

    return query.getMany();
  }

  // =====================================================
  // READ - Lấy banner theo ID
  // =====================================================
  async findOne(id: string): Promise<Banner> {
    const banner = await this.bannerRepository.findOne({
      where: { id },
      relations: ['creator'],
    });

    if (!banner) {
      throw new NotFoundException(`Banner với ID ${id} không tìm thấy`);
    }

    return banner;
  }

  // =====================================================
  // READ - Lấy banner hoạt động theo vị trí
  // =====================================================
  async getActiveBanners(position: BannerPosition): Promise<Banner[]> {
    const now = new Date();

    return this.bannerRepository.find({
      where: {
        position,
        isActive: true,
        startDate: Between(new Date('2000-01-01'), now),
        endDate: Between(now, new Date('2099-12-31')),
      },
      order: { displayOrder: 'ASC' },
    });
  }

  // =====================================================
  // READ - Lấy tất cả banner hoạt động
  // =====================================================
  async findAllActiveBanners(filters?: BannerFilterDto): Promise<Banner[]> {
    const now = new Date();

    const query = this.bannerRepository
      .createQueryBuilder('banner')
      .where('banner.isActive = :isActive', { isActive: true })
      .andWhere('banner.startDate <= :now', { now })
      .andWhere('banner.endDate >= :now', { now })
      .orderBy('banner.displayOrder', 'ASC')
      .addOrderBy('banner.createdAt', 'DESC');

    if (filters?.position) {
      query.andWhere('banner.position = :position', { position: filters.position });
    }

    if (filters?.targetType) {
      query.andWhere('banner.targetType = :targetType', { targetType: filters.targetType });
    }

    return query.getMany();
  }

  // =====================================================
  // READ - Lấy banner theo vị trí
  // =====================================================
  async getByPosition(position: BannerPosition): Promise<Banner[]> {
    return this.bannerRepository.find({
      where: { position, isActive: true },
      order: { displayOrder: 'ASC' },
    });
  }

  // =====================================================
  // UPDATE - Cập nhật banner
  // =====================================================
  async update(id: string, dto: UpdateBannerDto): Promise<Banner> {
    const banner = await this.findOne(id);

    Object.assign(banner, {
      ...dto,
      startDate: dto.startDate ? new Date(dto.startDate) : banner.startDate,
      endDate: dto.endDate ? new Date(dto.endDate) : banner.endDate,
    });

    return this.bannerRepository.save(banner);
  }

  // =====================================================
  // UPDATE - Cập nhật thứ tự hiển thị
  // =====================================================
  async updateDisplayOrder(id: string, displayOrder: number): Promise<Banner> {
    const banner = await this.findOne(id);
    banner.displayOrder = displayOrder;
    return this.bannerRepository.save(banner);
  }

  // =====================================================
  // UPDATE - Bật/Tắt banner
  // =====================================================
  async toggleActive(id: string): Promise<Banner> {
    const banner = await this.findOne(id);
    banner.isActive = !banner.isActive;
    return this.bannerRepository.save(banner);
  }

  // =====================================================
  // UPDATE - Activate banner
  // =====================================================
  async activate(id: string): Promise<Banner> {
    const banner = await this.findOne(id);
    banner.isActive = true;
    return this.bannerRepository.save(banner);
  }

  // =====================================================
  // UPDATE - Deactivate banner
  // =====================================================
  async deactivate(id: string): Promise<Banner> {
    const banner = await this.findOne(id);
    banner.isActive = false;
    return this.bannerRepository.save(banner);
  }

  // =====================================================
  // DELETE - Xóa banner
  // =====================================================
  async remove(id: string): Promise<void> {
    const banner = await this.findOne(id);
    await this.bannerRepository.remove(banner);
  }

  // =====================================================
  // ANALYTICS - Ghi nhận view
  // =====================================================
  async recordView(
    bannerId: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const banner = await this.bannerRepository.findOne({
      where: { id: bannerId },
    });

    if (!banner) {
      throw new NotFoundException('Banner không tìm thấy');
    }

    // Ghi nhận analytics
    await this.analyticsRepository.save({
      bannerId,
      userId,
      eventType: 'view',
      ipAddress,
      userAgent,
    });

    // Cập nhật views count
    banner.viewCount = (banner.viewCount || 0) + 1;
    await this.bannerRepository.save(banner);

    this.logger.debug(`Banner view recorded: ${bannerId}`);
  }

  // =====================================================
  // ANALYTICS - Ghi nhận click
  // =====================================================
  async recordClick(
    bannerId: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const banner = await this.bannerRepository.findOne({
      where: { id: bannerId },
    });

    if (!banner) {
      throw new NotFoundException('Banner không tìm thấy');
    }

    // Ghi nhận analytics
    await this.analyticsRepository.save({
      bannerId,
      userId,
      eventType: 'click',
      ipAddress,
      userAgent,
    });

    // Cập nhật clicks count
    banner.clickCount = (banner.clickCount || 0) + 1;
    await this.bannerRepository.save(banner);

    this.logger.debug(`Banner click recorded: ${bannerId}`);
  }

  // =====================================================
  // ANALYTICS - Lấy analytics của banner
  // =====================================================
  async getBannerAnalytics(
    bannerId: string,
    fromDate?: string,
    toDate?: string,
  ): Promise<any> {
    const query = this.analyticsRepository
      .createQueryBuilder('analytics')
      .where('analytics.bannerId = :bannerId', { bannerId });

    if (fromDate && toDate) {
      query.andWhere('analytics.createdAt BETWEEN :fromDate AND :toDate', {
        fromDate: new Date(fromDate),
        toDate: new Date(toDate),
      });
    }

    const data = await query.getMany();

    const views = data.filter((d) => d.eventType === 'view').length;
    const clicks = data.filter((d) => d.eventType === 'click').length;
    const ctr = views > 0 ? ((clicks / views) * 100).toFixed(2) : '0.00';

    return {
      views,
      clicks,
      clickThroughRate: ctr,
      uniqueUsers: new Set(data.map((d) => d.userId).filter((id) => id)).size,
    };
  }

  // =====================================================
  // ANALYTICS - Lấy analytics theo vị trí
  // =====================================================
  async getPositionAnalytics(position: BannerPosition): Promise<any> {
    const banners = await this.bannerRepository.find({
      where: { position },
    });

    const stats = banners.map((banner) => ({
      id: banner.id,
      title: banner.title,
      views: banner.viewCount,
      clicks: banner.clickCount,
      ctr: banner.viewCount > 0 ? ((banner.clickCount / banner.viewCount) * 100).toFixed(2) : '0.00',
    }));

    return {
      position,
      banners: stats,
      totalViews: stats.reduce((sum, b) => sum + b.views, 0),
      totalClicks: stats.reduce((sum, b) => sum + b.clicks, 0),
    };
  }

  // =====================================================
  // STATISTICS - Thống kê banner
  // =====================================================
  async getStatistics(): Promise<any> {
    const total = await this.bannerRepository.count();
    const active = await this.bannerRepository.count({
      where: { isActive: true },
    });

    const byPosition = await this.bannerRepository
      .createQueryBuilder('banner')
      .select('banner.position', 'position')
      .addSelect('COUNT(*)', 'count')
      .groupBy('banner.position')
      .getRawMany();

    const byTargetType = await this.bannerRepository
      .createQueryBuilder('banner')
      .select('banner.targetType', 'targetType')
      .addSelect('COUNT(*)', 'count')
      .groupBy('banner.targetType')
      .getRawMany();

    const topBanners = await this.bannerRepository.find({
      order: { clickCount: 'DESC' },
      take: 5,
    });

    return {
      total,
      active,
      inactive: total - active,
      byPosition: byPosition.map((p) => ({
        position: p.position,
        count: parseInt(p.count),
      })),
      byTargetType: byTargetType.map((t) => ({
        targetType: t.targetType,
        count: parseInt(t.count),
      })),
      topBanners: topBanners.map((b) => ({
        id: b.id,
        title: b.title,
        clicks: b.clickCount,
        views: b.viewCount,
        ctr: b.viewCount > 0 ? ((b.clickCount / b.viewCount) * 100).toFixed(2) : '0.00',
      })),
    };
  }

  // =====================================================
  // BULK OPERATIONS
  // =====================================================

  async updateBulkOrder(updates: { id: string; displayOrder: number }[]): Promise<void> {
    for (const update of updates) {
      const banner = await this.bannerRepository.findOne({
        where: { id: update.id },
      });
      if (banner) {
        banner.displayOrder = update.displayOrder;
        await this.bannerRepository.save(banner);
      }
    }
  }

  async bulkActivate(ids: string[]): Promise<void> {
    await this.bannerRepository.update({ id: ids as any }, { isActive: true });
  }

  async bulkDeactivate(ids: string[]): Promise<void> {
    await this.bannerRepository.update({ id: ids as any }, { isActive: false });
  }

  async bulkDelete(ids: string[]): Promise<void> {
    await this.bannerRepository.delete({ id: ids as any });
  }
}