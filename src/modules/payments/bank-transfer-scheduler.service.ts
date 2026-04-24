import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BankTransferService } from './bank-transfer.service';

@Injectable()
export class BankTransferSchedulerService {
    private readonly logger = new Logger(BankTransferSchedulerService.name);

    constructor(private readonly bankTransferService: BankTransferService) {}

    @Cron(CronExpression.EVERY_MINUTE)
    async cancelExpiredBookings() {
        const count = await this.bankTransferService.cancelExpiredBankTransferBookings();
        if (count > 0) {
            this.logger.log(`Cron: Đã hủy ${count} booking hết hạn thanh toán`);
        }
    }
}
