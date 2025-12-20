import { IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { NotificationType } from '../entities/notification.entity';

export class NotificationFilterDto {
  @IsOptional()
  @IsEnum(NotificationType)
  notificationType?: NotificationType;

  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @IsOptional()
  @IsBoolean()
  unreadOnly?: boolean;
}