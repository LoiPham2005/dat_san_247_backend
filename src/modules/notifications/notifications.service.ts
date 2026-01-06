import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private notificationRepository: Repository<Notification>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async broadcast(data: any) {
        const users = await this.userRepository.find({ select: ['id'] });
        const notifications = users.map(user => {
            const notification = new Notification();
            Object.assign(notification, data);
            notification.userId = user.id;
            return notification;
        });
        return this.notificationRepository.save(notifications);
    }

    async sendToUser(data: any) {
        const notification = this.notificationRepository.create(data);
        return this.notificationRepository.save(notification);
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
