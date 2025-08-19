// src/modules/bookings/dto/create-booking.dto.ts
import { IsNumber, IsEnum, IsDateString, IsString } from 'class-validator';
import { BookingStatus, PaymentStatus } from '../entities/booking.entity';

export class CreateBookingDto {
  @IsNumber()
  field_id: number;

  @IsNumber()
  customer_id: number;

  @IsDateString()
  date: string;

  @IsString()
  start_time: string;

  @IsString()
  end_time: string;

  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsNumber()
  total_price: number;

  @IsEnum(PaymentStatus)
  payment_status?: PaymentStatus;
}
