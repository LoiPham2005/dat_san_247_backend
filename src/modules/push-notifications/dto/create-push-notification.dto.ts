import { IsNotEmpty, IsOptional, IsEnum, IsString, IsArray, IsInt, IsObject } from 'class-validator';
import { PushTargetType, PushStatus } from '../entities/push-notification.entity';

export class CreatePushNotificationDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsEnum(PushTargetType)
  targetType: PushTargetType;

  @IsOptional()
  @IsArray()
  targetUsers?: number[];

  @IsOptional()
  @IsObject()
  targetConditions?: any;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  deepLink?: string;

  @IsOptional()
  scheduledAt?: Date;

  @IsOptional()
  @IsEnum(PushStatus)
  status?: PushStatus;

  @IsOptional()
  @IsInt()
  createdBy?: number;
}
