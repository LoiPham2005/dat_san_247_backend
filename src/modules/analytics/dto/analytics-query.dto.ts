// modules/analytics/dto/analytics-query.dto.ts
import { IsOptional, IsDateString, IsEnum, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum PeriodType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export class AnalyticsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ enum: PeriodType })
  @IsOptional()
  @IsEnum(PeriodType)
  period?: PeriodType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  venueId?: string;
}