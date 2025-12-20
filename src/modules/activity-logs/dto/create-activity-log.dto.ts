import { IsString, IsOptional, IsUUID, IsEnum, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeviceType } from '../entities/activity-log.entity';

export class CreateActivityLogDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty()
  @IsString()
  action: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  oldValues?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  newValues?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({ enum: DeviceType })
  @IsOptional()
  @IsEnum(DeviceType)
  deviceType?: DeviceType;
}