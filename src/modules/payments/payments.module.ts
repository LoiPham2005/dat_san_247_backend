import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { OwnerRevenueController } from './owner-revenue.controller';
import { WalletController } from './wallet.controller';
import { Payment } from './entities/payment.entity';
import { Wallet } from './entities/wallet.entity';
import { Transaction } from './entities/transaction.entity';
import { PayoutRequest } from './entities/payout-request.entity';
import { TransactionDispute } from './entities/transaction-dispute.entity';
import { Invoice } from './entities/invoice.entity';
import { TeamWallet } from './entities/team-wallet.entity';
import { AdminPaymentsController } from './admin-payments.controller';
import { StaffFinanceController } from './staff-finance.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Wallet, Transaction, PayoutRequest, TransactionDispute, Invoice, TeamWallet])],
  controllers: [
    PaymentsController,
    OwnerRevenueController,
    WalletController,
    AdminPaymentsController,
    StaffFinanceController,
  ],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule { }
