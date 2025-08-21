import { IsOptional, IsString, IsBoolean, IsInt } from 'class-validator';

export class CreateChatRoomDto {
  @IsOptional()
  @IsString()
  roomName?: string;

  @IsOptional()
  @IsBoolean()
  isGroup?: boolean;

  @IsOptional()
  @IsInt()
  venueId?: number;

  @IsOptional()
  @IsInt()
  bookingId?: number;
}
