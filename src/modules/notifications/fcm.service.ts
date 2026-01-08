import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FcmService implements OnModuleInit {
    private readonly logger = new Logger(FcmService.name);

    constructor(private configService: ConfigService) { }

    onModuleInit() {
        const projectId = this.configService.get<string>('firebase.projectId');
        const clientEmail = this.configService.get<string>('firebase.clientEmail');
        const privateKey = this.configService.get<string>('firebase.privateKey');

        if (!projectId || !clientEmail || !privateKey) {
            this.logger.warn('Firebase configuration is incomplete. Push notifications will not work.');
            return;
        }

        if (admin.apps.length === 0) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey,
                }),
            });
            this.logger.log('Firebase Admin initialized successfully');
        }
    }

    async sendPushNotification(token: string, title: string, body: string, data?: any) {
        if (!token) return;

        const message: admin.messaging.Message = {
            notification: {
                title,
                body,
            },
            data: data || {},
            token: token,
        };

        try {
            const response = await admin.messaging().send(message);
            this.logger.log('Successfully sent push notification:', response);
            return response;
        } catch (error) {
            this.logger.error('Error sending push notification:', error);
            throw error;
        }
    }

    async sendToTopic(topic: string, title: string, body: string, data?: any) {
        const message: admin.messaging.Message = {
            notification: {
                title,
                body,
            },
            data: data || {},
            topic: topic,
        };

        try {
            const response = await admin.messaging().send(message);
            this.logger.log(`Successfully sent message to topic ${topic}:`, response);
            return response;
        } catch (error) {
            this.logger.error(`Error sending message to topic ${topic}:`, error);
            throw error;
        }
    }

    async sendMulticast(tokens: string[], title: string, body: string, data?: any) {
        if (!tokens || tokens.length === 0) return;

        const message: admin.messaging.MulticastMessage = {
            notification: {
                title,
                body,
            },
            data: data || {},
            tokens: tokens,
        };

        try {
            const response = await admin.messaging().sendEachForMulticast(message);
            this.logger.log(`Successfully sent multicast notification to ${tokens.length} tokens`);
            return response;
        } catch (error) {
            this.logger.error('Error sending multicast notification:', error);
            throw error;
        }
    }
}
