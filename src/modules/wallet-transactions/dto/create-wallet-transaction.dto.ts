import { IsNotEmpty, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { WalletTransactionType, WalletTransactionStatus } from '../entities/wallet-transaction.entity';

export class CreateWalletTransactionDto {
  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  @IsEnum(WalletTransactionType)
  transactionType: WalletTransactionType;

  @IsNotEmpty()
  amount: number;

  @IsNotEmpty()
  balanceBefore: number;

  @IsNotEmpty()
  balanceAfter: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  relatedBookingId?: number;

  @IsOptional()
  relatedPaymentId?: number;

  @IsOptional()
  bankAccountInfo?: any;

  @IsOptional()
  @IsEnum(WalletTransactionStatus)
  status?: WalletTransactionStatus;

  @IsOptional()
  processedAt?: string;
}
