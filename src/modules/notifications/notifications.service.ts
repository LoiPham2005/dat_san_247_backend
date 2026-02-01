import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { UserDevice } from './entities/user-device.entity';
import { FcmService } from '../../shared/fcm/fcm.service';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private notificationRepository: Repository<Notification>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(UserDevice)
        private userDeviceRepository: Repository<UserDevice>,
        private fcmService: FcmService,
        private notificationsGateway: NotificationsGateway,
    ) { }

    async broadcast(data: any) {
        const users = await this.userRepository.find({ select: ['id'] });

        const notificationData = users.map(user => ({
            ...data,
            userId: user.id,
        }));

        // Save DB notifications
        const saved = await this.notificationRepository.save(notificationData);

        // Send Push notifications
        const devices = await this.userDeviceRepository.find({ where: { isActive: true }, select: ['fcmToken'] });
        const tokens = devices.map(d => d.fcmToken).filter(token => !!token);
        if (tokens.length > 0) {
            await this.fcmService.sendMulticast(tokens, data.title, data.message, data.data);
        }

        // Send Socket.io notifications
        this.notificationsGateway.sendToAll('new_notification', data);

        return saved;
    }

    async sendToUser(data: any & { userId: string }) {
        const notification = this.notificationRepository.create(data);
        const saved = await this.notificationRepository.save(notification);

        // Send Push notification
        const devices = await this.userDeviceRepository.find({
            where: { userId: data.userId, isActive: true },
            select: ['fcmToken']
        });
        const tokens = devices.map(d => d.fcmToken).filter(token => !!token);

        if (tokens.length > 0) {
            if (tokens.length === 1) {
                await this.fcmService.sendPushNotification(tokens[0], data.title, data.message, data.data);
            } else {
                await this.fcmService.sendMulticast(tokens, data.title, data.message, data.data);
            }
        }

        // Send Socket.io notification
        this.notificationsGateway.sendToUser(data.userId, 'new_notification', saved);

        return saved;
    }

    async findByUser(userId: string) {
        return this.notificationRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' }
        });
    }

    async markAsRead(userId: string, id: string) {
        const notification = await this.notificationRepository.findOne({ where: { id, userId } });
        if (notification) {
            notification.isRead = true;
            notification.readAt = new Date();
            await this.notificationRepository.save(notification);
        }
        return { success: true };
    }
}
