import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoomMembersService } from './chat-room-members.service';
import { ChatRoomMembersController } from './chat-room-members.controller';
import { ChatRoomMember } from './entities/chat-room-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatRoomMember])],
  controllers: [ChatRoomMembersController],
  providers: [ChatRoomMembersService],
  exports: [ChatRoomMembersService],
})
export class ChatRoomMembersModule {}
