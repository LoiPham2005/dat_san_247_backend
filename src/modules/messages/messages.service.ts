import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { success } from 'src/common/helper/response.helper';

@Injectable()
export class MessagesService {
    constructor(
        @InjectRepository(Message)
        private readonly messageRepo: Repository<Message>,
    ) { }

    async create(createDto: CreateMessageDto) {
        const message = this.messageRepo.create(createDto);
        const saved = await this.messageRepo.save(message);
        return success(saved, 'Tạo tin nhắn thành công');
    }

    async findAll() {
        const messages = await this.messageRepo.find({
            relations: ['room', 'sender'],
            order: { createdAt: 'ASC' },
        });
        return success(messages, 'Lấy danh sách tin nhắn thành công');
    }

    async findByRoom(roomId: number) {
        const messages = await this.messageRepo.find({
            where: { roomId },
            relations: ['sender'],
            order: { createdAt: 'ASC' },
        });
        return success(messages, 'Lấy danh sách tin nhắn trong phòng thành công');
    }

    async findOne(messageId: number) {
        const message = await this.messageRepo.findOne({
            where: { messageId },
            relations: ['room', 'sender'],
        });
        return success(message, 'Lấy chi tiết tin nhắn thành công');
    }

    async update(messageId: number, updateDto: UpdateMessageDto) {
        const result = await this.messageRepo.update({ messageId }, updateDto);
        return success(result, 'Cập nhật tin nhắn thành công');
    }

    async remove(messageId: number) {
        const result = await this.messageRepo.delete({ messageId });
        return success(result, 'Xóa tin nhắn thành công');
    }
}
