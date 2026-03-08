import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

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
            backoff: {
                type: 'fixed',
                delay: 5000,
            },
            removeOnComplete: true,
        });
    }

    async addSmsJob(data: any) {
        return await this.smsQueue.add('send-sms', data, {
            attempts: 3,
            backoff: {
                type: 'fixed',
                delay: 5000,
            },
            removeOnComplete: true,
        });
    }

    async addNotificationJob(data: any) {
        return await this.notificationQueue.add('send-notification', data, {
            attempts: 5,
            backoff: {
                type: 'fixed',
                delay: 10000,
            },
        });
    }

    async addJob(queueName: 'mail' | 'sms' | 'notifications', jobName: string, data: any, options: any = {}) {
        const queueMap = {
            mail: this.mailQueue,
            sms: this.smsQueue,
            notifications: this.notificationQueue,
        };

        const queue = queueMap[queueName];
        if (!queue) throw new Error(`Queue ${queueName} not found`);

        return await queue.add(jobName, data, {
            attempts: 3,
            backoff: {
                type: 'fixed',
                delay: 5000,
            },
            removeOnComplete: true,
            ...options,
        });
    }
}
