import { PartialType } from '@nestjs/mapped-types';
import { CreateBookingDto } from './create-booking.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { BookingStatus } from '../entities/booking.entity';

export class UpdateBookingDto extends PartialType(CreateBookingDto) {
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;
}