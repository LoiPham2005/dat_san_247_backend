import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { FcmService } from '../../fcm/fcm.service';
import { NotificationsService } from '../../../modules/notifications/notifications.service';
import { NotificationType, NotificationChannel } from '@prisma/client';

@Processor('notifications')
export class NotificationProcessor extends WorkerHost {
    private readonly logger = new Logger(NotificationProcessor.name);

    constructor(
        private readonly fcmService: FcmService,
        private readonly notificationsService: NotificationsService,
    ) {
        super();
    }

    async process(job: Job): Promise<any> {
        switch (job.name) {
            case 'send-notification':
                return this.handleSendNotification(job);
            default:
                this.logger.warn(`Unknown job name: ${job.name}`);
        }
    }

    private async handleSendNotification(job: Job) {
        this.logger.log(`Processing notification job: ${job.id}`);
        const { userId, tokens, title, message, data, type, referenceId, referenceType } = job.data;

        try {
            // 1. Lưu thông báo vào DB và bắn Realtime qua Socket.io (Web)
            if (userId) {
                await this.notificationsService.create({
                    userId,
                    type: type || NotificationType.SYSTEM,
                    channel: NotificationChannel.IN_APP,
                    title,
                    message,
                    referenceId,
                    referenceType,
                });
            }

            // 2. Gửi thông báo Push qua FCM (Mobile)
            if (tokens && (Array.isArray(tokens) ? tokens.length > 0 : !!tokens)) {
                if (Array.isArray(tokens)) {
                    await this.fcmService.sendMulticast(tokens, title, message, data);
                } else {
                    await this.fcmService.sendPushNotification(tokens, title, message, data);
                }
                this.logger.log(`Successfully sent push notification`);
            }
        } catch (error) {
            this.logger.error(`Failed to handle notification job`, error.stack);
            throw error;
        }
    }
}
