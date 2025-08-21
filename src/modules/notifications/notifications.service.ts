import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
  ) {}

  create(createDto: CreateNotificationDto) {
    const entity = this.repo.create(createDto);
    return this.repo.save(entity);
  }

  findAll() {
    return this.repo.find({ relations: ['user'], order: { createdAt: 'DESC' } });
  }

  findOne(notificationId: number) {
    return this.repo.findOne({ where: { notificationId }, relations: ['user'] });
  }

  findByUser(userId: number) {
    return this.repo.find({
      where: { userId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  update(notificationId: number, updateDto: UpdateNotificationDto) {
    return this.repo.update(notificationId, updateDto);
  }

  markAsRead(notificationId: number) {
    return this.repo.update(notificationId, { isRead: true, readAt: new Date() });
  }

  remove(notificationId: number) {
    return this.repo.delete(notificationId);
  }
}
