import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(MailService.name);

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('mail.host'),
            port: this.configService.get<number>('mail.port'),
            secure: this.configService.get<number>('mail.port') === 465, // true for 465, false for other ports
            auth: {
                user: this.configService.get<string>('mail.user'),
                pass: this.configService.get<string>('mail.pass'),
            },
        });
    }

    async sendMail(to: string, subject: string, html: string, text?: string) {
        try {
            const info = await this.transporter.sendMail({
                from: this.configService.get<string>('mail.from'),
                to,
                subject,
                text,
                html,
            });
            this.logger.log(`Email sent: ${info.messageId}`);
            return info;
        } catch (error) {
            this.logger.error('Error sending email:', error);
            throw error;
        }
    }
}
