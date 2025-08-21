import { IsNotEmpty, IsEnum, IsNumber, IsString } from 'class-validator';
import { DayType, PricingStatus } from '../entities/venue-pricing.entity';

export class CreateVenuePricingDto {
  @IsNotEmpty()
  venueId: number;

  @IsNotEmpty()
  @IsEnum(DayType)
  dayType: DayType;

  @IsNotEmpty()
  startTime: string; // HH:mm:ss

  @IsNotEmpty()
  endTime: string; // HH:mm:ss

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsEnum(PricingStatus)
  status?: PricingStatus;
}
