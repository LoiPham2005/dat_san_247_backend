import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { PaymentStatus, PaymentMethod } from '../entities/payment.entity';

export class PaymentFilterDto {
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;
}