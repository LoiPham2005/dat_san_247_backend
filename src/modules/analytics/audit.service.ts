import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
    constructor(private prisma: PrismaService) { }

    async log(data: {
        userId?: string;
        actorRole?: string;
        action: string;
        entityName: string;
        entityId?: string;
        oldValues?: any;
        newValues?: any;
        ipAddress?: string;
        userAgent?: string;
    }) {
        return this.prisma.audit_logs.create({
            data: {
                user_id: data.userId,
                actor_role: data.actorRole,
                action: data.action,
                entity_name: data.entityName,
                entity_id: data.entityId,
                old_values: data.oldValues,
                new_values: data.newValues,
                ip_address: data.ipAddress,
                user_agent: data.userAgent,
            }
        });
    }

    async findLogs(filter: any) {
        const { page = 1, limit = 20, action, entityName, userId } = filter;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (action) where.action = action;
        if (entityName) where.entity_name = entityName;
        if (userId) where.user_id = userId;

        const [items, total] = await Promise.all([
            this.prisma.audit_logs.findMany({
                where,
                include: { users: true },
                orderBy: { created_at: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.audit_logs.count({ where }),
        ]);

        return {
            items: items.map(item => ({
                ...item,
                user: item.users ? {
                    id: item.users.id,
                    fullName: item.users.full_name,
                    email: item.users.email,
                    avatarUrl: item.users.avatar_url,
                } : null
            })),
            meta: { total, page, limit }
        };
    }
}
