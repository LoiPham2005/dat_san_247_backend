import { IsNotEmpty, IsInt, IsBoolean, IsOptional } from 'class-validator';

export class CreateChatRoomMemberDto {
  @IsNotEmpty()
  @IsInt()
  roomId: number;

  @IsNotEmpty()
  @IsInt()
  userId: number;

  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;
}
