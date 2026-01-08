import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { MailService } from '../../mail/mail.service';

@Processor('mail')
export class MailProcessor {
    private readonly logger = new Logger(MailProcessor.name);

    constructor(private readonly mailService: MailService) { }

    @Process('send-mail')
    async handleSendMail(job: Job) {
        this.logger.log(`Processing mail job: ${job.id}`);
        const { to, subject, html, text } = job.data;

        try {
            await this.mailService.sendMail(to, subject, html, text);
            this.logger.log(`Successfully sent mail to ${to}`);
        } catch (error) {
            this.logger.error(`Failed to send mail to ${to}`, error.stack);
            throw error;
        }
    }
}
