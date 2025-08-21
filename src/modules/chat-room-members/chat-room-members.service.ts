import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatRoomMember } from './entities/chat-room-member.entity';
import { CreateChatRoomMemberDto } from './dto/create-chat-room-member.dto';
import { UpdateChatRoomMemberDto } from './dto/update-chat-room-member.dto';

@Injectable()
export class ChatRoomMembersService {
  constructor(
    @InjectRepository(ChatRoomMember)
    private readonly memberRepo: Repository<ChatRoomMember>,
  ) {}

  create(createDto: CreateChatRoomMemberDto) {
    const member = this.memberRepo.create(createDto);
    return this.memberRepo.save(member);
  }

  findAll() {
    return this.memberRepo.find({ relations: ['room', 'user'], order: { joinedAt: 'ASC' } });
  }

  findByRoom(roomId: number) {
    return this.memberRepo.find({ where: { roomId }, relations: ['user'], order: { joinedAt: 'ASC' } });
  }

  update(id: number, updateDto: UpdateChatRoomMemberDto) {
    return this.memberRepo.update({ id }, updateDto);
  }

  remove(id: number) {
    return this.memberRepo.delete({ id });
  }

  removeByRoom(roomId: number) {
    return this.memberRepo.delete({ roomId });
  }
}
