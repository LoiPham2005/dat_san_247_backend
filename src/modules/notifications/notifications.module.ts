import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationProcessor } from './processors/notification-processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, User]),
    BullModule.registerQueue({
      name: 'notifications',
    }),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationProcessor],
  exports: [NotificationsService],
})
export class NotificationsModule {}