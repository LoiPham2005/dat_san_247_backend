import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatRoom } from './entities/chat-room.entity';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { UpdateChatRoomDto } from './dto/update-chat-room.dto';

@Injectable()
export class ChatRoomsService {
  constructor(
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepo: Repository<ChatRoom>,
  ) {}

  create(createDto: CreateChatRoomDto) {
    const room = this.chatRoomRepo.create(createDto);
    return this.chatRoomRepo.save(room);
  }

  findAll() {
    return this.chatRoomRepo.find({ relations: ['venue', 'booking', 'messages'], order: { createdAt: 'DESC' } });
  }

  findOne(roomId: number) {
    return this.chatRoomRepo.findOne({ where: { roomId }, relations: ['venue', 'booking', 'messages'] });
  }

  update(roomId: number, updateDto: UpdateChatRoomDto) {
    return this.chatRoomRepo.update({ roomId }, updateDto);
  }

  remove(roomId: number) {
    return this.chatRoomRepo.delete({ roomId });
  }
}
