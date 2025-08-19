// src/modules/notifications/notification.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(dto: CreateNotificationDto): Promise<Notification> {
    const user = await this.userRepo.findOne({ where: { id: dto.user_id } });
    if (!user) throw new NotFoundException(`User with id ${dto.user_id} not found`);

    const notification = this.notificationRepo.create({ ...dto, user });
    return this.notificationRepo.save(notification);
  }

  async findAll(): Promise<Notification[]> {
    return this.notificationRepo.find({ relations: ['user'], order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<Notification> {
    const notification = await this.notificationRepo.findOne({ where: { id }, relations: ['user'] });
    if (!notification) throw new NotFoundException(`Notification with id ${id} not found`);
    return notification;
  }

  async update(id: number, dto: UpdateNotificationDto): Promise<Notification> {
    const notification = await this.findOne(id);
    Object.assign(notification, dto);
    return this.notificationRepo.save(notification);
  }

  async remove(id: number): Promise<void> {
    const notification = await this.findOne(id);
    await this.notificationRepo.remove(notification);
  }

  async markAsRead(id: number): Promise<Notification> {
    const notification = await this.findOne(id);
    notification.is_read = true;
    return this.notificationRepo.save(notification);
  }

  async findByUser(userId: number): Promise<Notification[]> {
    return this.notificationRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }
}
