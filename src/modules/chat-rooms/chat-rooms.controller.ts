import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ChatRoomsService } from './chat-rooms.service';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { UpdateChatRoomDto } from './dto/update-chat-room.dto';

@Controller('chat-rooms')
export class ChatRoomsController {
  constructor(private readonly chatRoomsService: ChatRoomsService) {}

  @Post()
  create(@Body() createDto: CreateChatRoomDto) {
    return this.chatRoomsService.create(createDto);
  }

  @Get()
  findAll() {
    return this.chatRoomsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.chatRoomsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateDto: UpdateChatRoomDto) {
    return this.chatRoomsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.chatRoomsService.remove(id);
  }
}
