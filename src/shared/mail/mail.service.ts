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

    async sendMail(to: string, subject: string, html: string, text?: string, fromName?: string, fromEmail?: string) {
        try {
            const info = await this.transporter.sendMail({
                from: fromName && fromEmail ? `"${fromName}" <${fromEmail}>` : this.configService.get<string>('mail.from'),
                to,
                subject,
                text,
                html,
            });
            this.logger.log(`Email sent to ${to}: ${info.messageId}`);
            return info;
        } catch (error) {
            this.logger.error(`Error sending email to ${to}:`, error);
            throw error;
        }
    }

    renderTemplate(html: string, variables: Record<string, any>) {
        return html.replace(/{{([\w.]+)}}/g, (match, key) => {
            const keys = key.split('.');
            let value = variables;
            for (const k of keys) {
                if (value && typeof value === 'object' && k in value) {
                    value = value[k];
                } else {
                    return match; // Key not found, return original placeholder
                }
            }
            return value !== undefined && value !== null ? String(value) : '';
        });
    }

    async sendWithTemplate(to: string, template: any, variables: Record<string, any> = {}) {
        const htmlContent = template.html_content || template.htmlContent;
        const textContent = template.text_content || template.textContent;
        const fromName = template.from_name || template.fromName;
        const fromEmail = template.from_email || template.fromEmail;
        const subject = template.subject;

        const html = this.renderTemplate(htmlContent, variables);
        const renderedSubject = this.renderTemplate(subject, variables);

        return this.sendMail(
            to,
            renderedSubject,
            html,
            textContent ? this.renderTemplate(textContent, variables) : undefined,
            fromName,
            fromEmail
        );
    }
}
