import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { OwnerRevenueController } from './owner-revenue.controller';
import { WalletController } from './wallet.controller';
import { AdminPaymentsController } from './admin-payments.controller';
import { StaffFinanceController } from './staff-finance.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
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
