import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { PushNotificationsService } from './push-notifications.service';
import { CreatePushNotificationDto } from './dto/create-push-notification.dto';
import { UpdatePushNotificationDto } from './dto/update-push-notification.dto';

@Controller('push-notifications')
export class PushNotificationsController {
  constructor(private readonly service: PushNotificationsService) {}

  @Post()
  create(@Body() createDto: CreatePushNotificationDto) {
    return this.service.create(createDto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateDto: UpdatePushNotificationDto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}
