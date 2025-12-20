// modules/support/dto/create-ticket.dto.ts
import { IsString, IsEnum, IsOptional, IsArray, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketCategory, TicketPriority } from '../entities/support-ticket.entity';

export class CreateTicketDto {
  @ApiProperty({ enum: TicketCategory })
  @IsEnum(TicketCategory)
  category: TicketCategory;

  @ApiProperty()
  @IsString()
  subject: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty({ enum: TicketPriority })
  @IsEnum(TicketPriority)
  priority: TicketPriority;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  relatedBookingId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  attachments?: string[];
}

export class AddMessageDto {
  @ApiProperty()
  @IsString()
  message: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  attachments?: string[];
}
