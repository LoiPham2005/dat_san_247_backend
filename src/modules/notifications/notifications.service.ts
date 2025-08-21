import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { success } from 'src/common/helper/response.helper';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private readonly repo: Repository<Notification>,
    ) { }

    async create(createDto: CreateNotificationDto) {
        const entity = this.repo.create(createDto);
        const saved = await this.repo.save(entity);
        return success(saved, 'Tạo thông báo thành công');
    }

    async findAll() {
        const notifications = await this.repo.find({
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
        return success(notifications, 'Lấy danh sách thông báo thành công');
    }

    async findOne(notificationId: number) {
        const notification = await this.repo.findOne({
            where: { notificationId },
            relations: ['user'],
        });
        return success(notification, 'Lấy chi tiết thông báo thành công');
    }

    async findByUser(userId: number) {
        const notifications = await this.repo.find({
            where: { userId },
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
        return success(notifications, 'Lấy danh sách thông báo của người dùng thành công');
    }

    async update(notificationId: number, updateDto: UpdateNotificationDto) {
        const result = await this.repo.update(notificationId, updateDto);
        return success(result, 'Cập nhật thông báo thành công');
    }

    async markAsRead(notificationId: number) {
        const result = await this.repo.update(notificationId, { isRead: true, readAt: new Date() });
        return success(result, 'Đánh dấu thông báo đã đọc thành công');
    }

    async remove(notificationId: number) {
        const result = await this.repo.delete(notificationId);
        return success(result, 'Xóa thông báo thành công');
    }
}
