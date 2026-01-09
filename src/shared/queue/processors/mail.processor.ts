import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MailService } from '../../mail/mail.service';

@Processor('mail')
export class MailProcessor extends WorkerHost {
    private readonly logger = new Logger(MailProcessor.name);

    constructor(private readonly mailService: MailService) {
        super();
    }

    async process(job: Job): Promise<any> {
        switch (job.name) {
            case 'send-mail':
                return this.handleSendMail(job);
            default:
                this.logger.warn(`Unknown job name: ${job.name}`);
        }
    }

    private async handleSendMail(job: Job) {
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
