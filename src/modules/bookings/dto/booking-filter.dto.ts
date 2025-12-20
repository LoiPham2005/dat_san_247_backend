import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';
import { BookingStatus } from '../entities/booking.entity';

export class BookingFilterDto {
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsString()
  courtId?: string;

  @IsOptional()
  @IsString()
  venueId?: string;
}