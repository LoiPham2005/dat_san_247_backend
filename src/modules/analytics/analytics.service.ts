import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from './entities/activity-log.entity';
import { ActivityType } from '../../common/constants/activity-type.constant';

@Injectable()
export class AnalyticsService {
    constructor(
        @InjectRepository(ActivityLog)
        private activityLogRepository: Repository<ActivityLog>,
    ) { }

    async logActivity(data: {
        userId: string;
        activityType: ActivityType;
        entityType?: string;
        entityId?: string;
        description?: string;
        metadata?: any;
    }) {
        const log = this.activityLogRepository.create(data);
        return this.activityLogRepository.save(log);
    }

    async findActivityLogs(filter: any) {
        const { page = 1, limit = 10, activityType, entityType, userId } = filter;
        const skip = (page - 1) * limit;

        const query = this.activityLogRepository.createQueryBuilder('log')
            .leftJoinAndSelect('log.user', 'user')
            .orderBy('log.createdAt', 'DESC');

        if (activityType) query.andWhere('log.activityType = :activityType', { activityType });
        if (entityType) query.andWhere('log.entityType = :entityType', { entityType });
        if (userId) query.andWhere('log.userId = :userId', { userId });

        const [items, total] = await query
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        return {
            items,
            meta: { total, page, limit }
        };
    }
}
