import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { AdminPaymentsController } from './admin-payments.controller';
import { OwnerRevenueController } from './owner-revenue.controller';
import { WalletController } from './wallet.controller';
import { StaffFinanceController } from './staff-finance.controller';
import { Payment } from './entities/payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment])],
  controllers: [
    PaymentsController,
    AdminPaymentsController,
    OwnerRevenueController,
    WalletController,
    StaffFinanceController,
  ],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule { }
