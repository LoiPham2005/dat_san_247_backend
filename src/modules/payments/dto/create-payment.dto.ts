import { IsNotEmpty, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaymentMethod, PaymentStatus } from '../entities/payment.entity';

export class CreatePaymentDto {
  @IsNotEmpty()
  bookingId: number;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  paymentGateway?: string;

  @IsOptional()
  transactionId?: string;

  @IsNotEmpty()
  amount: number;

  @IsOptional()
  currency?: string;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  paymentDate?: string;

  @IsOptional()
  refundAmount?: number;

  @IsOptional()
  refundDate?: string;

  @IsOptional()
  gatewayResponse?: any;

  @IsOptional()
  failureReason?: string;
}
