import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Processor('notifications')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  @Process('send-push')
  async handleSendPush(job: Job) {
    const { userId, fcmToken, notification } = job.data;

    try {
      if (!admin.apps.length) {
        throw new Error('Firebase Admin not initialized');
      }

      const message = {
        notification: {
          title: notification.title,
          body: notification.content,
        },
        data: {
          relatedId: notification.relatedId || '',
          relatedType: notification.relatedType || '',
          type: notification.notificationType,
        },
        token: fcmToken,
      };

      const response = await admin.messaging().send(message);
      this.logger.log(`Push sent to ${userId}: ${response}`);
      return { success: true, response };
    } catch (error) {
      this.logger.error(`Failed to send push: ${error.message}`);
      throw error;
    }
  }
}