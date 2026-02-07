import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { AdminNotificationsController } from './admin-notifications.controller';
import { NotificationsGateway } from './notifications.gateway';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserDevice } from './entities/user-device.entity';
import { SystemAnnouncement } from './entities/system-announcement.entity';
import { NotificationSetting } from './entities/notification-setting.entity';

@Module({
  imports: [
    ConfigModule,
    JwtModule,
  ],
  controllers: [NotificationsController, AdminNotificationsController],
  providers: [NotificationsService, NotificationsGateway],
  exports: [NotificationsService],
})
export class NotificationsModule { }
