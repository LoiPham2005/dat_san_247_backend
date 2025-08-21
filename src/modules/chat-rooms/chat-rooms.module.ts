import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoomsService } from './chat-rooms.service';
import { ChatRoomsController } from './chat-rooms.controller';
import { ChatRoom } from './entities/chat-room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatRoom])],
  controllers: [ChatRoomsController],
  providers: [ChatRoomsService],
  exports: [ChatRoomsService],
})
export class ChatRoomsModule {}
