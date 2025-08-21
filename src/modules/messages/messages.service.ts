import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
  ) {}

  create(createDto: CreateMessageDto) {
    const message = this.messageRepo.create(createDto);
    return this.messageRepo.save(message);
  }

  findAll() {
    return this.messageRepo.find({ relations: ['room', 'sender'], order: { createdAt: 'ASC' } });
  }

  findByRoom(roomId: number) {
    return this.messageRepo.find({ where: { roomId }, relations: ['sender'], order: { createdAt: 'ASC' } });
  }

  findOne(messageId: number) {
    return this.messageRepo.findOne({ where: { messageId }, relations: ['room', 'sender'] });
  }

  update(messageId: number, updateDto: UpdateMessageDto) {
    return this.messageRepo.update({ messageId }, updateDto);
  }

  remove(messageId: number) {
    return this.messageRepo.delete({ messageId });
  }
}
