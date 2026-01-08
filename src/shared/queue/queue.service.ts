import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class QueueService {
    constructor(
        @InjectQueue('mail') private mailQueue: Queue,
        @InjectQueue('sms') private smsQueue: Queue,
        @InjectQueue('notifications') private notificationQueue: Queue,
    ) { }

    async addMailJob(data: any) {
        return await this.mailQueue.add('send-mail', data, {
            attempts: 3,
            backoff: 5000,
            removeOnComplete: true,
        });
    }

    async addSmsJob(data: any) {
        return await this.smsQueue.add('send-sms', data, {
            attempts: 3,
            backoff: 5000,
            removeOnComplete: true,
        });
    }

    async addNotificationJob(data: any) {
        return await this.notificationQueue.add('send-notification', data, {
            attempts: 5,
            backoff: 10000,
            removeOnComplete: true,
        });
    }
}
