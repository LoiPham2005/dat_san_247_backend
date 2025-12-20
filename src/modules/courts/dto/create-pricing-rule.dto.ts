// modules/courts/dto/create-pricing-rule.dto.ts
import { IsUUID, IsEnum, IsString, IsNumber, IsBoolean, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DayType } from '../entities/pricing-rule.entity';

export class CreatePricingRuleDto {
  @ApiProperty()
  @IsUUID()
  courtId: string;

  @ApiProperty({ enum: DayType })
  @IsEnum(DayType)
  dayType: DayType;

  @ApiProperty({ example: '06:00' })
  @IsString()
  timeFrom: string;

  @ApiProperty({ example: '18:00' })
  @IsString()
  timeTo: string;

  @ApiProperty()
  @IsNumber()
  pricePerHour: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  minBookingDuration?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxBookingDuration?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  validTo?: string;
}