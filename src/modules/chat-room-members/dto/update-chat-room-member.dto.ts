import { PartialType } from '@nestjs/mapped-types';
import { CreateChatRoomMemberDto } from './create-chat-room-member.dto';

export class UpdateChatRoomMemberDto extends PartialType(CreateChatRoomMemberDto) {}
