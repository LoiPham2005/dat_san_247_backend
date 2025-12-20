import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';
import { DeviceType } from '../entities/activity-log.entity';

export class ActivityLogFilterDto {
  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsEnum(DeviceType)
  deviceType?: DeviceType;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsString()
  searchQuery?: string;
}