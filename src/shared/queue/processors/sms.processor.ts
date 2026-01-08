import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { SmsService } from '../../sms/sms.service';

@Processor('sms')
export class SmsProcessor {
    private readonly logger = new Logger(SmsProcessor.name);

    constructor(private readonly smsService: SmsService) { }

    @Process('send-sms')
    async handleSendSms(job: Job) {
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
