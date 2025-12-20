import { IsUUID, IsNumber, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod, PaymentType } from '../entities/payment.entity';

export class CreatePaymentDto {
  @ApiProperty()
  @IsUUID()
  bookingId: string;

  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ enum: PaymentType })
  @IsEnum(PaymentType)
  paymentType: PaymentType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}