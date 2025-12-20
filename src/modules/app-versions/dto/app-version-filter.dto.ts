import { IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { Platform } from '../entities/app-version.entity';

export class AppVersionFilterDto {
  @IsOptional()
  @IsEnum(Platform)
  platform?: Platform;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isForceUpdate?: boolean;
}