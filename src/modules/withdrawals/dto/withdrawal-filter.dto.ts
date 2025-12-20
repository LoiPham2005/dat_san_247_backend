import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';
import { WithdrawalStatus } from '../entities/withdrawal-request.entity';

export class WithdrawalFilterDto {
  @IsOptional()
  @IsEnum(WithdrawalStatus)
  status?: WithdrawalStatus;

  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsString()
  searchQuery?: string;
}