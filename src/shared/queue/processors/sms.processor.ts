import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { SmsService } from '../../sms/sms.service';

@Processor('sms')
export class SmsProcessor extends WorkerHost {
    private readonly logger = new Logger(SmsProcessor.name);

    constructor(private readonly smsService: SmsService) {
        super();
    }

    async process(job: Job): Promise<any> {
        switch (job.name) {
            case 'send-sms':
                return this.handleSendSms(job);
            default:
                this.logger.warn(`Unknown job name: ${job.name}`);
        }
    }

    private async handleSendSms(job: Job) {
        this.logger.log(`Processing SMS job: ${job.id}`);
        const { phone, message } = job.data;

        try {
            await this.smsService.sendSms(phone, message);
            this.logger.log(`Successfully sent SMS to ${phone}`);
        } catch (error) {
            this.logger.error(`Failed to send SMS to ${phone}`, error.stack);
            throw error;
        }
    }
}
