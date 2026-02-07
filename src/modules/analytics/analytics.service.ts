import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivityType } from '../../common/constants/activity-type.constant';

@Injectable()
export class AnalyticsService {
    constructor(
        private prisma: PrismaService,
    ) { }

    async logActivity(data: {
        userId: string;
        activityType: ActivityType;
        entityType?: string;
        entityId?: string;
        description?: string;
        metadata?: any;
    }) {
        return this.prisma.activity_logs.create({
            data: {
                user_id: data.userId,
                activity_type: data.activityType as any,
                entity_type: data.entityType,
                entity_id: data.entityId,
                description: data.description,
                metadata: data.metadata,
                created_at: new Date(),
                updated_at: new Date(),
            }
        });
    }

    async findActivityLogs(filter: any) {
        const { page = 1, limit = 10, activityType, entityType, userId } = filter;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (activityType) where.activity_type = activityType as any;
        if (entityType) where.entity_type = entityType;
        if (userId) where.user_id = userId;

        const [items, total] = await Promise.all([
            this.prisma.activity_logs.findMany({
                where,
                include: { users: true },
                orderBy: { created_at: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.activity_logs.count({ where }),
        ]);

        return {
            items: items.map(log => this.mapActivityLog(log)),
            meta: { total, page, limit }
        };
    }

    private mapActivityLog(log: any) {
        return {
            id: log.id,
            userId: log.user_id,
            activityType: log.activity_type,
            entityType: log.entity_type,
            entityId: log.entity_id,
            description: log.description,
            metadata: log.metadata,
            ipAddress: log.ip_address,
            userAgent: log.user_agent,
            createdAt: log.created_at,
            updatedAt: log.updated_at,
            user: log.users ? {
                id: log.users.id,
                fullName: log.users.full_name,
                email: log.users.email,
                avatarUrl: log.users.avatar_url,
            } : null,
        };
    }
}
