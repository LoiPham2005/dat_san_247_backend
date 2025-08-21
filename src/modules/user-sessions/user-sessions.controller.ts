import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { UserSessionsService } from './user-sessions.service';
import { CreateUserSessionDto } from './dto/create-user-session.dto';
import { UpdateUserSessionDto } from './dto/update-user-session.dto';

@Controller('user-sessions')
export class UserSessionsController {
  constructor(private readonly userSessionsService: UserSessionsService) {}

  @Post()
  create(@Body() createDto: CreateUserSessionDto) {
    return this.userSessionsService.create(createDto);
  }

  @Get()
  findAll() {
    return this.userSessionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userSessionsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateUserSessionDto) {
    return this.userSessionsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userSessionsService.remove(id);
  }
}
