import { IsNotEmpty, IsEnum, IsOptional, IsBoolean, IsString } from 'class-validator';
import { DayOfWeek } from '../entities/venue-operating-hour.entity';

export class CreateVenueOperatingHourDto {
  @IsNotEmpty()
  venueId: number;

  @IsNotEmpty()
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @IsNotEmpty()
  openingTime: string; // HH:mm:ss

  @IsNotEmpty()
  closingTime: string; // HH:mm:ss

  @IsOptional()
  @IsBoolean()
  isClosed?: boolean;

  @IsOptional()
  breakStartTime?: string;

  @IsOptional()
  breakEndTime?: string;
}
