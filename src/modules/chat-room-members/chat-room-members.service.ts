import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatRoomMember } from './entities/chat-room-member.entity';
import { CreateChatRoomMemberDto } from './dto/create-chat-room-member.dto';
import { UpdateChatRoomMemberDto } from './dto/update-chat-room-member.dto';
import { success } from 'src/common/helper/response.helper';

@Injectable()
export class ChatRoomMembersService {
  constructor(
    @InjectRepository(ChatRoomMember)
    private readonly memberRepo: Repository<ChatRoomMember>,
  ) {}

  async create(createDto: CreateChatRoomMemberDto) {
    const member = this.memberRepo.create(createDto);
    const saved = await this.memberRepo.save(member);
    return success(saved, 'Thêm thành viên vào phòng chat thành công');
  }

  async findAll() {
    const members = await this.memberRepo.find({
      relations: ['room', 'user'],
      order: { joinedAt: 'ASC' },
    });
    return success(members, 'Lấy danh sách thành viên thành công');
  }

  async findByRoom(roomId: number) {
    const members = await this.memberRepo.find({
      where: { roomId },
      relations: ['user'],
      order: { joinedAt: 'ASC' },
    });
    return success(members, 'Lấy danh sách thành viên trong phòng thành công');
  }

  async update(id: number, updateDto: UpdateChatRoomMemberDto) {
    const result = await this.memberRepo.update({ id }, updateDto);
    return success(result, 'Cập nhật thông tin thành viên thành công');
  }

  async remove(id: number) {
    const result = await this.memberRepo.delete({ id });
    return success(result, 'Xóa thành viên khỏi phòng thành công');
  }

  async removeByRoom(roomId: number) {
    const result = await this.memberRepo.delete({ roomId });
    return success(result, 'Xóa tất cả thành viên trong phòng thành công');
  }
}
