import { IsNotEmpty, IsInt, IsEnum, IsOptional, IsString, IsBoolean } from 'class-validator';
import { MessageType } from '../entities/message.entity';

export class CreateMessageDto {
  @IsNotEmpty()
  @IsInt()
  roomId: number;

  @IsNotEmpty()
  @IsInt()
  senderId: number;

  @IsNotEmpty()
  @IsString()
  messageText: string;

  @IsOptional()
  @IsEnum(MessageType)
  messageType?: MessageType;

  @IsOptional()
  @IsString()
  attachmentUrl?: string;

  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}
