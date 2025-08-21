import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ChatRoomMembersService } from './chat-room-members.service';
import { CreateChatRoomMemberDto } from './dto/create-chat-room-member.dto';
import { UpdateChatRoomMemberDto } from './dto/update-chat-room-member.dto';

@Controller('chat-room-members')
export class ChatRoomMembersController {
  constructor(private readonly membersService: ChatRoomMembersService) {}

  @Post()
  create(@Body() createDto: CreateChatRoomMemberDto) {
    return this.membersService.create(createDto);
  }

  @Get()
  findAll() {
    return this.membersService.findAll();
  }

  @Get('room/:roomId')
  findByRoom(@Param('roomId') roomId: number) {
    return this.membersService.findByRoom(roomId);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateDto: UpdateChatRoomMemberDto) {
    return this.membersService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.membersService.remove(id);
  }
}
