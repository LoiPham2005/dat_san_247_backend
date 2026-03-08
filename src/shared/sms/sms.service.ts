import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SmsService {
    private readonly logger = new Logger(SmsService.name);

    constructor(private configService: ConfigService) { }

    async send(phone: string, message: string) {
        const provider = this.configService.get<string>('sms.provider');

        switch (provider) {
            case 'speedsms':
                return this.sendViaSpeedSms(phone, message);
            case 'twilio':
                return this.sendViaTwilio(phone, message);
            case 'mock':
            default:
                this.logger.log(`[MOCK SMS] To: ${phone}, Message: ${message}`);
                return { success: true, messageId: 'mock-id' };
        }
    }

    private async sendViaSpeedSms(phone: string, message: string) {
        const apiKey = this.configService.get<string>('sms.apiKey');
        // SpeedSMS API implementation
        try {
            const response = await axios.get(`https://api.speedsms.vn/index.php/sms/send`, {
                params: {
                    access_key: apiKey,
                    to: phone,
                    content: message,
                    type: 2, // 2 is for private content/OTP
                }
            });
            return response.data;
        } catch (error) {
            this.logger.error('SpeedSMS Error:', error);
            throw error;
        }
    }

    private async sendViaTwilio(phone: string, message: string) {
        // Twilio implementation would go here (requires twilio package)
        this.logger.warn('Twilio provider not fully implemented yet.');
        return { success: false, error: 'Not implemented' };
    }
}
