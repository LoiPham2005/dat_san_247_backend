import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService) { }

    async create(data: any) {
        return (this.prisma.notifications as any).create({
            data: {
                user_id: data.userId,
                title: data.title,
                content: data.content,
                type: data.type,
                data: data.data || {},
                is_read: false
            }
        });
    }

    async findAllByUser(userId: string) {
        return this.prisma.notifications.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' }
        });
    }

    // Alias to match controllers using findByUser
    async findByUser(userId: string) {
        return this.findAllByUser(userId);
    }

    async markAsRead(userId: string, id: string) {
        return (this.prisma.notifications as any).update({
            where: { id, user_id: userId },
            data: { is_read: true, updated_at: new Date() }
        });
    }

    async markAllAsRead(userId: string) {
        return (this.prisma.notifications as any).updateMany({
            where: { user_id: userId, is_read: false },
            data: { is_read: true, updated_at: new Date() }
        });
    }

    async broadcast(data: any) {
        const users = await this.prisma.users.findMany({ where: { status: 'ACTIVE' } });
        const notifications = users.map(user => ({
            user_id: user.id,
            title: data.title,
            content: data.content,
            type: data.type || 'SYSTEM',
            data: data.data || {},
            is_read: false
        }));

        return (this.prisma.notifications as any).createMany({
            data: notifications
        });
    }

    async sendToUser(data: any) {
        return this.create(data);
    }
}
