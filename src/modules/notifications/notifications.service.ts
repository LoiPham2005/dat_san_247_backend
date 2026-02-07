import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FcmService } from '../../shared/fcm/fcm.service';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
    constructor(
        private prisma: PrismaService,
        private fcmService: FcmService,
        private notificationsGateway: NotificationsGateway,
    ) { }

    private mapNotification(n: any) {
        if (!n) return null;
        return {
            ...n,
            isRead: n.is_read,
            readAt: n.read_at,
            userId: n.user_id,
            createdAt: n.created_at,
            updatedAt: n.updated_at,
        };
    }

    async broadcast(data: any) {
        const users = await this.prisma.users.findMany({ select: { id: true } });

        const notificationData = users.map(user => ({
            user_id: user.id,
            title: data.title,
            message: data.message,
            data: data.data || {},
            is_read: false,
            type: data.type || 'SYSTEM',
            channel: data.channel || 'IN_APP',
            created_at: new Date(),
            updated_at: new Date(),
        }));

        // Batch create
        // createMany does not return records. We return count.
        const result = await this.prisma.notifications.createMany({
            data: notificationData
        });

        // Send Push notifications
        const devices = await this.prisma.user_devices.findMany({
            where: { is_active: true },
            select: { fcm_token: true }
        });
        const tokens = devices.map(d => d.fcm_token).filter(token => !!token);

        if (tokens.length > 0) {
            await this.fcmService.sendMulticast(tokens, data.title, data.message, data.data);
        }

        // Send Socket.io notifications
        this.notificationsGateway.sendToAll('new_notification', data);

        return { count: result.count, exampleInfo: 'Notifications sent' };
    }

    async sendToUser(data: any & { userId: string }) {
        const created = await this.prisma.notifications.create({
            data: {
                user_id: data.userId,
                title: data.title,
                message: data.message,
                data: data.data || {},
                is_read: false,
                type: data.type || 'SYSTEM',
                channel: data.channel || 'IN_APP',
                created_at: new Date(),
                updated_at: new Date(),
            }
        });

        // Send Push notification
        const devices = await this.prisma.user_devices.findMany({
            where: { user_id: data.userId, is_active: true },
            select: { fcm_token: true }
        });
        const tokens = devices.map(d => d.fcm_token).filter(token => !!token);

        if (tokens.length > 0) {
            if (tokens.length === 1) {
                await this.fcmService.sendPushNotification(tokens[0], data.title, data.message, data.data);
            } else {
                await this.fcmService.sendMulticast(tokens, data.title, data.message, data.data);
            }
        }

        const mapped = this.mapNotification(created);
        // Send Socket.io notification
        this.notificationsGateway.sendToUser(data.userId, 'new_notification', mapped);

        return mapped;
    }

    async findByUser(userId: string) {
        const notifications = await this.prisma.notifications.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' }
        });
        return notifications.map(n => this.mapNotification(n));
    }

    async markAsRead(userId: string, id: string) {
        const notification = await this.prisma.notifications.findFirst({
            where: { id, user_id: userId }
        });

        if (notification) {
            await this.prisma.notifications.update({
                where: { id: notification.id },
                data: {
                    is_read: true,
                    read_at: new Date(),
                    updated_at: new Date(),
                }
            });
        }
        return { success: true };
    }
}
