import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { FcmService } from '../../fcm/fcm.service';

@Processor('notifications')
export class NotificationProcessor {
    private readonly logger = new Logger(NotificationProcessor.name);

    constructor(private readonly fcmService: FcmService) { }

    @Process('send-notification')
    async handleSendNotification(job: Job) {
        this.logger.log(`Processing notification job: ${job.id}`);
        const { tokens, title, message, data } = job.data;

        try {
            if (Array.isArray(tokens)) {
                await this.fcmService.sendMulticast(tokens, title, message, data);
            } else {
                await this.fcmService.sendPushNotification(tokens, title, message, data);
            }
            this.logger.log(`Successfully sent push notification`);
        } catch (error) {
            this.logger.error(`Failed to send push notification`, error.stack);
            throw error;
        }
    }
}
