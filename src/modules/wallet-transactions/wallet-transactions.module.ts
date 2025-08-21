import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletTransactionsService } from './wallet-transactions.service';
import { WalletTransactionsController } from './wallet-transactions.controller';
import { WalletTransaction } from './entities/wallet-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WalletTransaction])],
  controllers: [WalletTransactionsController],
  providers: [WalletTransactionsService],
  exports: [WalletTransactionsService],
})
export class WalletTransactionsModule {}
