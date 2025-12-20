import { IsString, IsEnum, IsOptional, IsUUID, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType, SentVia } from '../entities/notification.entity';

export class CreateNotificationDto {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty({ enum: NotificationType })
  @IsEnum(NotificationType)
  notificationType: NotificationType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  relatedId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  relatedType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  actionUrl?: string;

  @ApiProperty({ enum: SentVia })
  @IsEnum(SentVia)
  sentVia: SentVia;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  recipientIds?: string[];
}