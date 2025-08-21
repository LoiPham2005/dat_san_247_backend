import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PushNotification } from './entities/push-notification.entity';
import { CreatePushNotificationDto } from './dto/create-push-notification.dto';
import { UpdatePushNotificationDto } from './dto/update-push-notification.dto';

@Injectable()
export class PushNotificationsService {
  constructor(
    @InjectRepository(PushNotification)
    private readonly repo: Repository<PushNotification>,
  ) {}

  create(createDto: CreatePushNotificationDto) {
    const entity = this.repo.create(createDto);
    return this.repo.save(entity);
  }

  findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  findOne(pushId: number) {
    return this.repo.findOne({ where: { pushId } });
  }

  update(pushId: number, updateDto: UpdatePushNotificationDto) {
    return this.repo.update(pushId, updateDto);
  }

  remove(pushId: number) {
    return this.repo.delete(pushId);
  }
}
