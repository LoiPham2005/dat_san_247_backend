import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PushNotification } from './entities/push-notification.entity';
import { CreatePushNotificationDto } from './dto/create-push-notification.dto';
import { UpdatePushNotificationDto } from './dto/update-push-notification.dto';
import { success } from 'src/common/helper/response.helper';

@Injectable()
export class PushNotificationsService {
    constructor(
        @InjectRepository(PushNotification)
        private readonly repo: Repository<PushNotification>,
    ) { }

    async create(createDto: CreatePushNotificationDto) {
        const entity = this.repo.create(createDto);
        const saved = await this.repo.save(entity);
        return success(saved, 'Tạo push notification thành công');
    }

    async findAll() {
        const pushes = await this.repo.find({ order: { createdAt: 'DESC' } });
        return success(pushes, 'Lấy danh sách push notification thành công');
    }

    async findOne(pushId: number) {
        const push = await this.repo.findOne({ where: { pushId } });
        return success(push, 'Lấy chi tiết push notification thành công');
    }

    async update(pushId: number, updateDto: UpdatePushNotificationDto) {
        const result = await this.repo.update(pushId, updateDto);
        return success(result, 'Cập nhật push notification thành công');
    }

    async remove(pushId: number) {
        const result = await this.repo.delete(pushId);
        return success(result, 'Xóa push notification thành công');
    }
}
