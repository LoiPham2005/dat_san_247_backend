import { Injectable, Logger, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting, SettingType, SettingCategory } from './entities/setting.entity';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { SettingFilterDto } from './dto/setting-filter.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);
  private readonly CACHE_PREFIX = 'setting_';
  private readonly SETTINGS_CACHE_KEY = 'all_settings';

  constructor(
    @InjectRepository(Setting)
    private settingRepository: Repository<Setting>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) { }

  // =====================================================
  // CREATE - Tạo setting mới
  // =====================================================
  async create(dto: CreateSettingDto, userId?: string): Promise<Setting> {
    this.logger.log(`Creating setting: ${dto.settingKey}`);

    // Kiểm tra setting đã tồn tại
    const existing = await this.settingRepository.findOne({
      where: { settingKey: dto.settingKey },
    });

    if (existing) {
      throw new BadRequestException(`Setting ${dto.settingKey} already exists`);
    }

    const setting = this.settingRepository.create({
      ...dto,
      updatedBy: userId,
    });

    const savedSetting = await this.settingRepository.save(setting);

    // Clear cache
    await this.invalidateCache();

    return savedSetting;
  }

  // =====================================================
  // READ - Lấy tất cả settings
  // =====================================================
  async findAll(filters?: SettingFilterDto): Promise<Setting[]> {
    const query = this.settingRepository
      .createQueryBuilder('setting')
      .leftJoinAndSelect('setting.updater', 'updater')
      .orderBy('setting.category', 'ASC')
      .addOrderBy('setting.settingKey', 'ASC');

    if (filters?.settingKey) {
      query.andWhere('setting.settingKey ILIKE :key', {
        key: `%${filters.settingKey}%`,
      });
    }

    if (filters?.category) {
      query.andWhere('setting.category = :category', {
        category: filters.category,
      });
    }

    if (filters?.settingType) {
      query.andWhere('setting.settingType = :type', {
        type: filters.settingType,
      });
    }

    if (filters?.searchQuery) {
      query.andWhere(
        '(setting.settingKey ILIKE :search OR setting.description ILIKE :search OR setting.settingValue ILIKE :search)',
        { search: `%${filters.searchQuery}%` }
      );
    }

    return query.getMany();
  }

  // =====================================================
  // READ - Lấy setting theo ID
  // =====================================================
  async findOne(id: string): Promise<Setting> {
    const setting = await this.settingRepository.findOne({
      where: { id },
      relations: ['updater'],
    });

    if (!setting) {
      throw new NotFoundException(`Setting with ID ${id} not found`);
    }

    return setting;
  }

  // =====================================================
  // READ - Lấy setting theo key
  // =====================================================
  async getByKey(settingKey: string): Promise<any> {
    // Kiểm tra cache
    const cacheKey = `${this.CACHE_PREFIX}${settingKey}`;
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      return cached;
    }

    const setting = await this.settingRepository.findOne({
      where: { settingKey },
    });

    if (!setting) {
      return null;
    }

    // Parse value dựa trên type
    const value = this.parseSettingValue(setting.settingValue, setting.settingType);

    // Cache 24 giờ
    await this.cacheManager.set(cacheKey, value, 86400000);

    return value;
  }

  // =====================================================
  // READ - Lấy tất cả settings theo category
  // =====================================================
  async getByCategory(category: string): Promise<any> {
    const settings = await this.settingRepository.find({
      where: { category },
    });

    const result = {};
    settings.forEach((setting) => {
      result[setting.settingKey] = this.parseSettingValue(
        setting.settingValue,
        setting.settingType
      );
    });

    return result;
  }

  // =====================================================
  // READ - Lấy tất cả settings (cached)
  // =====================================================
  async getAllSettings(): Promise<Record<string, any>> {
    // Kiểm tra cache
    const cached = await this.cacheManager.get(this.SETTINGS_CACHE_KEY);
    if (cached) {
      return cached as Record<string, any>;
    }

    const settings = await this.settingRepository.find();
    const result = {};

    settings.forEach((setting) => {
      result[setting.settingKey] = this.parseSettingValue(
        setting.settingValue,
        setting.settingType
      );
    });

    // Cache 24 giờ
    await this.cacheManager.set(this.SETTINGS_CACHE_KEY, result, 86400000);

    return result;
  }

  // =====================================================
  // READ - Lấy public settings
  // =====================================================
  async getPublicSettings(): Promise<any> {
    const settings = await this.settingRepository.find({
      where: { isPublic: true },
    });

    const result = {};
    settings.forEach((setting) => {
      result[setting.settingKey] = this.parseSettingValue(
        setting.settingValue,
        setting.settingType
      );
    });

    return result;
  }

  // =====================================================
  // UPDATE - Cập nhật setting
  // =====================================================
  async update(
    id: string,
    dto: UpdateSettingDto,
    userId?: string
  ): Promise<Setting> {
    const setting = await this.findOne(id);

    Object.assign(setting, {
      ...dto,
      updatedBy: userId,
    });

    const updated = await this.settingRepository.save(setting);

    // Clear cache
    await this.invalidateCache();

    return updated;
  }

  // =====================================================
  // UPDATE - Cập nhật setting theo key
  // =====================================================
  async updateByKey(
    settingKey: string,
    settingValue: string,
    userId?: string
  ): Promise<Setting> {
    const setting = await this.settingRepository.findOne({
      where: { settingKey },
    });

    if (!setting) {
      throw new NotFoundException(`Setting ${settingKey} not found`);
    }

    setting.settingValue = settingValue;
    setting.updatedBy = userId;

    const updated = await this.settingRepository.save(setting);

    // Clear cache
    const cacheKey = `${this.CACHE_PREFIX}${settingKey}`;
    await this.cacheManager.del(cacheKey);
    await this.cacheManager.del(this.SETTINGS_CACHE_KEY);

    return updated;
  }

  // =====================================================
  // UPDATE - Bulk update settings
  // =====================================================
  async bulkUpdate(
    updates: { settingKey: string; settingValue: string }[],
    userId?: string
  ): Promise<void> {
    for (const update of updates) {
      await this.updateByKey(update.settingKey, update.settingValue, userId);
    }
  }

  // =====================================================
  // DELETE - Xóa setting
  // =====================================================
  async remove(id: string): Promise<void> {
    const setting = await this.findOne(id);

    await this.settingRepository.remove(setting);

    // Clear cache
    const cacheKey = `${this.CACHE_PREFIX}${setting.settingKey}`;
    await this.cacheManager.del(cacheKey);
    await this.cacheManager.del(this.SETTINGS_CACHE_KEY);
  }

  // =====================================================
  // DELETE - Xóa settings theo category
  // =====================================================
  async removeByCategory(category: string): Promise<void> {
    const settings = await this.settingRepository.find({
      where: { category },
    });

    await this.settingRepository.remove(settings);

    // Clear cache
    await this.invalidateCache();
  }

  // =====================================================
  // UTILITIES - Hỗ trợ các setting thông dụng
  // =====================================================

  // Mail settings
  async getMailSettings(): Promise<any> {
    return this.getByCategory(SettingCategory.EMAIL);
  }

  async setMailSettings(mailSettings: any, userId?: string): Promise<void> {
    const settings = [
      { key: 'MAIL_HOST', value: mailSettings.host },
      { key: 'MAIL_PORT', value: mailSettings.port },
      { key: 'MAIL_USER', value: mailSettings.user },
      { key: 'MAIL_PASSWORD', value: mailSettings.password },
      { key: 'MAIL_FROM', value: mailSettings.from },
    ];

    for (const setting of settings) {
      await this.updateByKey(setting.key, setting.value.toString(), userId);
    }
  }

  // Payment settings
  async getPaymentSettings(): Promise<any> {
    return this.getByCategory(SettingCategory.PAYMENT);
  }

  async setPaymentSettings(paymentSettings: any, userId?: string): Promise<void> {
    const settings = [
      { key: 'VNPAY_TMN_CODE', value: paymentSettings.vnpayTmnCode },
      { key: 'VNPAY_HASH_SECRET', value: paymentSettings.vnpayHashSecret },
      { key: 'MOMO_ACCESS_KEY', value: paymentSettings.momoAccessKey },
      { key: 'MOMO_SECRET_KEY', value: paymentSettings.momoSecretKey },
      { key: 'ZALOPAY_APP_ID', value: paymentSettings.zalopayAppId },
      { key: 'ZALOPAY_KEY1', value: paymentSettings.zalopayKey1 },
    ];

    for (const setting of settings) {
      await this.updateByKey(setting.key, setting.value.toString(), userId);
    }
  }

  // Commission settings
  async getCommissionSettings(): Promise<any> {
    return this.getByCategory(SettingCategory.COMMISSION);
  }

  async setCommissionSettings(commissionSettings: any, userId?: string): Promise<void> {
    const settings = [
      { key: 'COMMISSION_PERCENT', value: commissionSettings.percent },
      { key: 'MIN_COMMISSION', value: commissionSettings.min },
      { key: 'MAX_COMMISSION', value: commissionSettings.max },
    ];

    for (const setting of settings) {
      await this.updateByKey(setting.key, setting.value.toString(), userId);
    }
  }

  // Booking settings
  async getBookingSettings(): Promise<any> {
    return this.getByCategory(SettingCategory.BOOKING);
  }

  async setBookingSettings(bookingSettings: any, userId?: string): Promise<void> {
    const settings = [
      { key: 'MIN_BOOKING_ADVANCE_HOURS', value: bookingSettings.minAdvanceHours },
      { key: 'MAX_BOOKING_ADVANCE_DAYS', value: bookingSettings.maxAdvanceDays },
      { key: 'CANCELLATION_DEADLINE_HOURS', value: bookingSettings.cancellationDeadline },
      { key: 'DEPOSIT_PERCENT', value: bookingSettings.depositPercent },
    ];

    for (const setting of settings) {
      await this.updateByKey(setting.key, setting.value.toString(), userId);
    }
  }

  // Security settings
  async getSecuritySettings(): Promise<any> {
    return this.getByCategory(SettingCategory.SECURITY);
  }

  async setSecuritySettings(securitySettings: any, userId?: string): Promise<void> {
    const settings = [
      { key: 'MAX_LOGIN_ATTEMPTS', value: securitySettings.maxLoginAttempts },
      { key: 'LOGIN_LOCK_DURATION_MINUTES', value: securitySettings.lockDuration },
      { key: 'PASSWORD_MIN_LENGTH', value: securitySettings.passwordMinLength },
      { key: 'SESSION_TIMEOUT_MINUTES', value: securitySettings.sessionTimeout },
    ];

    for (const setting of settings) {
      await this.updateByKey(setting.key, setting.value.toString(), userId);
    }
  }

  // =====================================================
  // STATISTICS - Thống kê settings
  // =====================================================
  async getStatistics(): Promise<any> {
    const total = await this.settingRepository.count();

    const byCategory = await this.settingRepository
      .createQueryBuilder('setting')
      .select('setting.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .groupBy('setting.category')
      .getRawMany();

    const byType = await this.settingRepository
      .createQueryBuilder('setting')
      .select('setting.settingType', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('setting.settingType')
      .getRawMany();

    const publicSettings = await this.settingRepository.count({
      where: { isPublic: true },
    });

    return {
      total,
      publicSettings,
      byCategory: byCategory.map((item) => ({
        category: item.category,
        count: parseInt(item.count),
      })),
      byType: byType.map((item) => ({
        type: item.type,
        count: parseInt(item.count),
      })),
    };
  }

  // =====================================================
  // EXPORT - Export settings
  // =====================================================
  async exportSettings(): Promise<any[]> {
    const settings = await this.settingRepository.find();

    return settings.map((setting) => ({
      settingKey: setting.settingKey,
      settingValue: setting.settingValue,
      settingType: setting.settingType,
      category: setting.category,
      description: setting.description,
      isPublic: setting.isPublic,
      updatedAt: setting.updatedAt,
    }));
  }

  // =====================================================
  // IMPORT - Import settings
  // =====================================================
  async importSettings(settings: any[], userId?: string): Promise<void> {
    for (const setting of settings) {
      const existing = await this.settingRepository.findOne({
        where: { settingKey: setting.settingKey },
      });

      if (existing) {
        await this.updateByKey(setting.settingKey, setting.settingValue, userId);
      } else {
        await this.create(setting, userId);
      }
    }
  }

  // =====================================================
  // HELPERS - Hàm hỗ trợ
  // =====================================================

  private parseSettingValue(value: string, type: SettingType): any {
    try {
      switch (type) {
        case SettingType.BOOLEAN:
          return value.toLowerCase() === 'true' || value === '1';
        case SettingType.NUMBER:
          return Number(value);
        case SettingType.JSON:
          return JSON.parse(value);
        case SettingType.STRING:
        default:
          return value;
      }
    } catch (error) {
      this.logger.warn(`Failed to parse setting value: ${value} (${type})`);
      return value;
    }
  }

  private async invalidateCache(): Promise<void> {
    await this.cacheManager.del(this.SETTINGS_CACHE_KEY);

    // Xóa tất cả cache setting
    const keys = await (this.cacheManager as any).store.keys();
    const settingKeys = keys.filter((key) => key.startsWith(this.CACHE_PREFIX));

    for (const key of settingKeys) {
      await this.cacheManager.del(key);
    }
  }
}