import { IsNotEmpty, IsNumber, IsOptional, IsEnum, IsString } from 'class-validator';
import { WalletStatus } from '../entities/user-wallet.entity';

export class CreateUserWalletDto {
  @IsNotEmpty()
  userId: number;

  @IsOptional()
  @IsNumber()
  balance?: number;

  @IsOptional()
  @IsNumber()
  totalEarned?: number;

  @IsOptional()
  @IsNumber()
  totalSpent?: number;

  @IsOptional()
  @IsNumber()
  frozenAmount?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsEnum(WalletStatus)
  status?: WalletStatus;
}
