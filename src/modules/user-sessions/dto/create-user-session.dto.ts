import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DeviceType } from '../entities/user-session.entity';

export class CreateUserSessionDto {
  @IsNotEmpty()
  userId: number;

  @IsEnum(DeviceType)
  deviceType: DeviceType;

  @IsOptional()
  deviceInfo?: Record<string, any>;

  @IsOptional()
  ipAddress?: string;

  @IsOptional()
  locationInfo?: Record<string, any>;

  @IsOptional()
  fcmToken?: string;
}
