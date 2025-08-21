import { IsNotEmpty, IsEnum, IsNumber, IsString, IsOptional } from 'class-validator';
import { BookingStatus, PaymentStatus, PaymentMethod } from '../entities/booking.entity';

export class CreateBookingDto {
  @IsNotEmpty()
  customerId: number;

  @IsNotEmpty()
  venueId: number;

  @IsNotEmpty()
  bookingDate: string; // YYYY-MM-DD

  @IsNotEmpty()
  startTime: string; // HH:mm:ss

  @IsNotEmpty()
  endTime: string; // HH:mm:ss

  @IsNotEmpty()
  totalAmount: number;

  @IsNotEmpty()
  commissionFee: number;

  @IsOptional()
  discountAmount?: number;

  @IsNotEmpty()
  finalAmount: number;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsNotEmpty()
  @IsString()
  bookingCode: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  cancellationReason?: string;

  @IsOptional()
  cancelledAt?: string;

  @IsOptional()
  cancellationPolicy?: any;
}
