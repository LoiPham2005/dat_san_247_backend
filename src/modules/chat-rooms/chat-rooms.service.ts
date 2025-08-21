import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatRoom } from './entities/chat-room.entity';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { UpdateChatRoomDto } from './dto/update-chat-room.dto';
import { success } from 'src/common/helper/response.helper';

@Injectable()
export class ChatRoomsService {
    constructor(
        @InjectRepository(ChatRoom)
        private readonly chatRoomRepo: Repository<ChatRoom>,
    ) { }

    async create(createDto: CreateChatRoomDto) {
        const room = this.chatRoomRepo.create(createDto);
        const saved = await this.chatRoomRepo.save(room);
        return success(saved, 'Tạo phòng chat thành công');
    }

    async findAll() {
        const rooms = await this.chatRoomRepo.find({
            relations: ['venue', 'booking', 'messages'],
            order: { createdAt: 'DESC' },
        });
        return success(rooms, 'Lấy danh sách phòng chat thành công');
    }

    async findOne(roomId: number) {
        const room = await this.chatRoomRepo.findOne({
            where: { roomId },
            relations: ['venue', 'booking', 'messages'],
        });
        return success(room, 'Lấy chi tiết phòng chat thành công');
    }

    async update(roomId: number, updateDto: UpdateChatRoomDto) {
        const result = await this.chatRoomRepo.update({ roomId }, updateDto);
        return success(result, 'Cập nhật phòng chat thành công');
    }

    async remove(roomId: number) {
        const result = await this.chatRoomRepo.delete({ roomId });
        return success(result, 'Xóa phòng chat thành công');
    }
}
