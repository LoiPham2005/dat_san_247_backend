import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, ILike, In } from 'typeorm';
import { ActivityLog, ActivityAction, DeviceType } from './entities/activity-log.entity';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { ActivityLogFilterDto } from './dto/activity-log-filter.dto';

@Injectable()
export class ActivityLogsService {
  private readonly logger = new Logger(ActivityLogsService.name);

  constructor(
    @InjectRepository(ActivityLog)
    private activityLogRepository: Repository<ActivityLog>,
  ) {}

  // =====================================================
  // CREATE - Tạo activity log
  // =====================================================
  async create(dto: CreateActivityLogDto): Promise<ActivityLog> {
    try {
      const log = this.activityLogRepository.create({
        ...dto,
        status: 'success',
      });

      return this.activityLogRepository.save(log);
    } catch (error) {
      this.logger.error(`Failed to create activity log: ${error.message}`);
      throw error;
    }
  }

  // =====================================================
  // CREATE - Tạo activity log với error
  // =====================================================
  async createWithError(
    dto: CreateActivityLogDto,
    error: Error,
  ): Promise<ActivityLog> {
    const log = this.activityLogRepository.create({
      ...dto,
      status: 'failed',
      errorMessage: error.message,
    });

    return this.activityLogRepository.save(log);
  }

  // =====================================================
  // READ - Lấy tất cả activity logs
  // =====================================================
  async findAll(filters?: ActivityLogFilterDto, page: number = 1, limit: number = 50): Promise<any> {
    const query = this.activityLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .orderBy('log.createdAt', 'DESC');

    if (filters?.action) {
      query.andWhere('log.action ILIKE :action', { action: `%${filters.action}%` });
    }

    if (filters?.entityType) {
      query.andWhere('log.entityType = :entityType', { entityType: filters.entityType });
    }

    if (filters?.userId) {
      query.andWhere('log.userId = :userId', { userId: filters.userId });
    }

    if (filters?.deviceType) {
      query.andWhere('log.deviceType = :deviceType', { deviceType: filters.deviceType });
    }

    if (filters?.fromDate && filters?.toDate) {
      query.andWhere('log.createdAt BETWEEN :fromDate AND :toDate', {
        fromDate: new Date(filters.fromDate),
        toDate: new Date(filters.toDate),
      });
    }

    if (filters?.searchQuery) {
      query.andWhere(
        '(log.action ILIKE :search OR log.entityType ILIKE :search OR user.fullName ILIKE :search)',
        { search: `%${filters.searchQuery}%` }
      );
    }

    const skip = (page - 1) * limit;
    const [logs, total] = await query.skip(skip).take(limit).getManyAndCount();

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // =====================================================
  // READ - Lấy activity log theo ID
  // =====================================================
  async findOne(id: string): Promise<ActivityLog> {
    const log = await this.activityLogRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!log) {
      throw new NotFoundException(`Activity log with ID ${id} not found`);
    }

    return log;
  }

  // =====================================================
  // READ - Lấy activity logs của user
  // =====================================================
  async findByUser(
    userId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<any> {
    const query = this.activityLogRepository
      .createQueryBuilder('log')
      .where('log.userId = :userId', { userId })
      .orderBy('log.createdAt', 'DESC');

    const skip = (page - 1) * limit;
    const [logs, total] = await query.skip(skip).take(limit).getManyAndCount();

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // =====================================================
  // READ - Lấy activity logs theo entity
  // =====================================================
  async findByEntity(
    entityType: string,
    entityId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<any> {
    const query = this.activityLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .where('log.entityType = :entityType', { entityType })
      .andWhere('log.entityId = :entityId', { entityId })
      .orderBy('log.createdAt', 'DESC');

    const skip = (page - 1) * limit;
    const [logs, total] = await query.skip(skip).take(limit).getManyAndCount();

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // =====================================================
  // READ - Lấy activity logs theo action
  // =====================================================
  async findByAction(
    action: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<any> {
    const query = this.activityLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .where('log.action ILIKE :action', { action: `%${action}%` })
      .orderBy('log.createdAt', 'DESC');

    const skip = (page - 1) * limit;
    const [logs, total] = await query.skip(skip).take(limit).getManyAndCount();

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // =====================================================
  // READ - Lấy activity logs theo device
  // =====================================================
  async findByDevice(
    deviceType: DeviceType,
    page: number = 1,
    limit: number = 50,
  ): Promise<any> {
    const query = this.activityLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .where('log.deviceType = :deviceType', { deviceType })
      .orderBy('log.createdAt', 'DESC');

    const skip = (page - 1) * limit;
    const [logs, total] = await query.skip(skip).take(limit).getManyAndCount();

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // =====================================================
  // DELETE - Xóa activity log
  // =====================================================
  async remove(id: string): Promise<void> {
    const log = await this.findOne(id);
    await this.activityLogRepository.remove(log);
  }

  // =====================================================
  // DELETE - Xóa activity logs cũ
  // =====================================================
  async removeOldLogs(daysOld: number = 90): Promise<void> {
    const date = new Date();
    date.setDate(date.getDate() - daysOld);

    const result = await this.activityLogRepository.delete({
      createdAt: Between(new Date('2000-01-01'), date),
    });

    this.logger.log(`Deleted ${result.affected} old activity logs`);
  }

  // =====================================================
  // DELETE - Xóa activity logs của user
  // =====================================================
  async removeByUser(userId: string): Promise<void> {
    await this.activityLogRepository.delete({ userId });
  }

  // =====================================================
  // STATISTICS - Thống kê activity
  // =====================================================
  async getStatistics(filters?: ActivityLogFilterDto): Promise<any> {
    const query = this.activityLogRepository.createQueryBuilder('log');

    if (filters?.userId) {
      query.where('log.userId = :userId', { userId: filters.userId });
    }

    if (filters?.fromDate && filters?.toDate) {
      query.andWhere('log.createdAt BETWEEN :fromDate AND :toDate', {
        fromDate: new Date(filters.fromDate),
        toDate: new Date(filters.toDate),
      });
    }

    const total = await query.getCount();

    // Thống kê theo action
    const byAction = await this.activityLogRepository
      .createQueryBuilder('log')
      .select('log.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.action')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    // Thống kê theo entity type
    const byEntity = await this.activityLogRepository
      .createQueryBuilder('log')
      .select('log.entityType', 'entityType')
      .addSelect('COUNT(*)', 'count')
      .where('log.entityType IS NOT NULL')
      .groupBy('log.entityType')
      .orderBy('count', 'DESC')
      .getRawMany();

    // Thống kê theo device
    const byDevice = await this.activityLogRepository
      .createQueryBuilder('log')
      .select('log.deviceType', 'deviceType')
      .addSelect('COUNT(*)', 'count')
      .where('log.deviceType IS NOT NULL')
      .groupBy('log.deviceType')
      .getRawMany();

    // Thống kê theo status
    const byStatus = await this.activityLogRepository
      .createQueryBuilder('log')
      .select('log.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.status')
      .getRawMany();

    // Users hoạt động nhất
    const topUsers = await this.activityLogRepository
      .createQueryBuilder('log')
      .select('log.userId', 'userId')
      .addSelect('COUNT(*)', 'count')
      .where('log.userId IS NOT NULL')
      .groupBy('log.userId')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      total,
      byAction: byAction.map((a) => ({
        action: a.action,
        count: parseInt(a.count),
      })),
      byEntity: byEntity.map((e) => ({
        entityType: e.entityType,
        count: parseInt(e.count),
      })),
      byDevice: byDevice.map((d) => ({
        deviceType: d.deviceType,
        count: parseInt(d.count),
      })),
      byStatus: byStatus.map((s) => ({
        status: s.status,
        count: parseInt(s.count),
      })),
      topUsers,
    };
  }

  // =====================================================
  // ANALYTICS - Hoạt động hàng ngày
  // =====================================================
  async getDailyActivity(days: number = 30): Promise<any[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activities = await this.activityLogRepository
      .createQueryBuilder('log')
      .select("DATE(log.created_at)", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('log.created_at >= :startDate', { startDate })
      .groupBy("DATE(log.created_at)")
      .orderBy('date', 'ASC')
      .getRawMany();

    return activities.map((a) => ({
      date: a.date,
      count: parseInt(a.count),
    }));
  }

  // =====================================================
  // ANALYTICS - Hoạt động theo giờ
  // =====================================================
  async getHourlyActivity(date: string): Promise<any[]> {
    const activities = await this.activityLogRepository
      .createQueryBuilder('log')
      .select("EXTRACT(HOUR FROM log.created_at)", 'hour')
      .addSelect('COUNT(*)', 'count')
      .where('DATE(log.created_at) = :date', { date })
      .groupBy("EXTRACT(HOUR FROM log.created_at)")
      .orderBy('hour', 'ASC')
      .getRawMany();

    return activities.map((a) => ({
      hour: parseInt(a.hour),
      count: parseInt(a.count),
    }));
  }

  // =====================================================
  // ANALYTICS - Active users
  // =====================================================
  async getActiveUsers(days: number = 7): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activeUsers = await this.activityLogRepository
      .createQueryBuilder('log')
      .select('COUNT(DISTINCT log.userId)', 'count')
      .where('log.created_at >= :startDate', { startDate })
      .getRawOne();

    const totalUsers = await this.activityLogRepository
      .createQueryBuilder('log')
      .select('COUNT(DISTINCT log.userId)', 'count')
      .getRawOne();

    return {
      activeUsers: parseInt(activeUsers.count || 0),
      totalUsers: parseInt(totalUsers.count || 0),
      days,
    };
  }

  // =====================================================
  // ANALYTICS - User activity timeline
  // =====================================================
  async getUserActivityTimeline(
    userId: string,
    days: number = 30,
  ): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activities = await this.activityLogRepository
      .createQueryBuilder('log')
      .where('log.userId = :userId', { userId })
      .andWhere('log.created_at >= :startDate', { startDate })
      .orderBy('log.created_at', 'DESC')
      .getMany();

    return activities.map((log) => ({
      id: log.id,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      deviceType: log.deviceType,
      ipAddress: log.ipAddress,
      timestamp: log.createdAt,
      status: log.status,
    }));
  }

  // =====================================================
  // EXPORT - Export activity logs
  // =====================================================
  async exportLogs(filters?: ActivityLogFilterDto): Promise<any[]> {
    const query = this.activityLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user');

    if (filters?.userId) {
      query.andWhere('log.userId = :userId', { userId: filters.userId });
    }

    if (filters?.action) {
      query.andWhere('log.action ILIKE :action', { action: `%${filters.action}%` });
    }

    if (filters?.fromDate && filters?.toDate) {
      query.andWhere('log.createdAt BETWEEN :fromDate AND :toDate', {
        fromDate: new Date(filters.fromDate),
        toDate: new Date(filters.toDate),
      });
    }

    const logs = await query.getMany();

    return logs.map((log) => ({
      id: log.id,
      userId: log.userId,
      userName: log.user?.fullName,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      ipAddress: log.ipAddress,
      deviceType: log.deviceType,
      status: log.status,
      errorMessage: log.errorMessage,
      createdAt: log.createdAt,
    }));
  }

  // =====================================================
  // AUDIT - Theo dõi thay đổi entity
  // =====================================================
  async logEntityChange(
    userId: string,
    entityType: string,
    entityId: string,
    action: string,
    oldValues: Record<string, any>,
    newValues: Record<string, any>,
    request?: any,
  ): Promise<ActivityLog> {
    const log = this.activityLogRepository.create({
      userId,
      action,
      entityType,
      entityId,
      oldValues,
      newValues,
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'],
      deviceType: this.detectDeviceType(request?.headers['user-agent']),
      status: 'success',
    });

    return this.activityLogRepository.save(log);
  }

  // =====================================================
  // UTILITIES - Helper methods
  // =====================================================

  private detectDeviceType(userAgent: string): DeviceType {
    if (!userAgent) return DeviceType.WEB;

    if (/iPad|iPhone|iPod/.test(userAgent)) {
      return DeviceType.IOS;
    } else if (/Android/.test(userAgent)) {
      return DeviceType.ANDROID;
    }

    return DeviceType.WEB;
  }

  // =====================================================
  // CLEANUP - Xóa logs định kỳ
  // =====================================================
  async cleanupOldLogs(): Promise<void> {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const result = await this.activityLogRepository.delete({
      createdAt: Between(new Date('2000-01-01'), ninetyDaysAgo),
    });

    this.logger.log(`Cleaned up ${result.affected} old activity logs`);
  }
}