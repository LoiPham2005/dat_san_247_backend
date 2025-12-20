// =====================================================
// SHARED MODULE - Updated with all services
// =====================================================

// shared/shared.module.ts
import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { EmailService } from './services/email.service';
import { UploadService } from './services/upload.service';
import { SchedulerService } from './services/scheduler.service';
import { UploadController } from './controllers/upload.controller';
import { Booking } from '../modules/bookings/entities/booking.entity';
import { Notification } from '../modules/notifications/entities/notification.entity';
import { NotificationsModule } from '../modules/notifications/notifications.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Notification]),
    BullModule.registerQueue(
      {
        name: 'email',
      },
      {
        name: 'notifications',
      }
    ),
    NotificationsModule,
  ],
  controllers: [UploadController],
  providers: [EmailService, UploadService, SchedulerService],
  exports: [EmailService, UploadService, SchedulerService, NotificationsModule],
})
export class SharedModule {}