import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SettingType } from '../entities/setting.entity';

export class CreateSettingDto {
  @ApiProperty()
  @IsString()
  settingKey: string;

  @ApiProperty()
  @IsString()
  settingValue: string;

  @ApiProperty({ enum: SettingType })
  @IsEnum(SettingType)
  settingType: SettingType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}