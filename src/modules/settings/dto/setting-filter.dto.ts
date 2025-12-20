import { IsOptional, IsString, IsEnum } from 'class-validator';
import { SettingType } from '../entities/setting.entity';

export class SettingFilterDto {
  @IsOptional()
  @IsString()
  settingKey?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(SettingType)
  settingType?: SettingType;

  @IsOptional()
  @IsString()
  searchQuery?: string;
}