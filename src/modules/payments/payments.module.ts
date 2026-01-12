import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { SuperAdminPaymentsController } from './super-admin-payments.controller';
import { OwnerRevenueController } from './owner-revenue.controller';
import { WalletController } from './wallet.controller';
import { SuperAdminFinanceController } from './super-admin-finance.controller';
import { Payment } from './entities/payment.entity';
import { AdminPaymentsController } from './admin-payments.controller';
import { StaffFinanceController } from './staff-finance.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Payment])],
  controllers: [
    PaymentsController,
    SuperAdminPaymentsController,
    OwnerRevenueController,
    WalletController,
    SuperAdminFinanceController,
    AdminPaymentsController,
    StaffFinanceController  , 
  ],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule { }
