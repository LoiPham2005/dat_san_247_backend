import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, IsUUID } from 'class-validator';
import { NotificationType } from '@prisma/client';

export enum SendTarget {
  ALL = 'ALL',
  ROLES = 'ROLES',
  USERS = 'USERS',
}

export class AdminSendNotificationDto {
  @IsEnum(SendTarget)
  @IsNotEmpty()
  target: SendTarget;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  userIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  roles?: string[];

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType;
}
