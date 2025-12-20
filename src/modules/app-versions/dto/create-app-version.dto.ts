import { IsString, IsEnum, IsNumber, IsOptional, IsBoolean, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Platform } from '../entities/app-version.entity';

export class CreateAppVersionDto {
  @ApiProperty({ enum: Platform })
  @IsEnum(Platform)
  platform: Platform;

  @ApiProperty({ example: '1.0.0' })
  @IsString()
  versionNumber: string;

  @ApiProperty()
  @IsNumber()
  buildNumber: number;

  @ApiPropertyOptional({ example: '0.9.0' })
  @IsOptional()
  @IsString()
  minSupportedVersion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isForceUpdate?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  releaseNotes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  downloadUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}