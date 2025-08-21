import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  create(@Body() createDto: CreateMessageDto) {
    return this.messagesService.create(createDto);
  }

  @Get()
  findAll() {
    return this.messagesService.findAll();
  }

  @Get('room/:roomId')
  findByRoom(@Param('roomId') roomId: number) {
    return this.messagesService.findByRoom(roomId);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.messagesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateDto: UpdateMessageDto) {
    return this.messagesService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.messagesService.remove(id);
  }
}
