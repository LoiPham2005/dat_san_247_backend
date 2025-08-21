import { IsNotEmpty, IsInt, IsOptional, IsEnum, IsString, IsBoolean } from 'class-validator';
import { NotificationType } from '../entities/notification.entity';

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsInt()
  userId: number;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsEnum(NotificationType)
  notificationType: NotificationType;

  @IsOptional()
  @IsInt()
  relatedId?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  deepLink?: string;

  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}
