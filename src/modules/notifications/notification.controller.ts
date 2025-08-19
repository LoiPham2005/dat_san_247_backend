// src/modules/notifications/notification.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  create(@Body() dto: CreateNotificationDto) {
    return this.notificationService.create(dto);
  }

  @Get()
  findAll() {
    return this.notificationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.notificationService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateNotificationDto) {
    return this.notificationService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.notificationService.remove(id);
  }

  @Put(':id/read')
  markAsRead(@Param('id') id: number) {
    return this.notificationService.markAsRead(id);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: number) {
    return this.notificationService.findByUser(userId);
  }
}
