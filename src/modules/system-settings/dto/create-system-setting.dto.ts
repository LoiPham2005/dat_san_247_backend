import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSystemSettingDto {
  @IsString()
  @IsNotEmpty()
  settingKey: string;

  @IsString()
  @IsNotEmpty()
  settingValue: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['string', 'number', 'boolean', 'json'])
  settingType?: 'string' | 'number' | 'boolean' | 'json';

  @IsOptional()
  @IsEnum(['payment', 'notification', 'booking', 'system'])
  category?: 'payment' | 'notification' | 'booking' | 'system';

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
