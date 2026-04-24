import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { WalletService } from './wallet.service';
import { TransactionService } from './transaction.service';
import { InvoiceService } from './invoice.service';
import { PayoutService } from './payout.service';
import { CommissionService } from './commission.service';
import { BankTransferService } from './bank-transfer.service';
import { BankTransferSchedulerService } from './bank-transfer-scheduler.service';
import { CustomerController } from './controllers/customer.controller';
import { OwnerController } from './controllers/owner.controller';
import { WebhookController } from './controllers/webhook.controller';
import { AdminController } from './controllers/admin.controller';

@Module({
    controllers: [
        CustomerController,
        OwnerController,
        WebhookController,
        AdminController,
    ],
    providers: [
        PaymentsService,
        WalletService,
        TransactionService,
        InvoiceService,
        PayoutService,
        CommissionService,
        BankTransferService,
        BankTransferSchedulerService,
    ],
    exports: [PaymentsService, WalletService, BankTransferService],
})
export class PaymentsModule {}
