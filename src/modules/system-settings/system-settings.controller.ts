import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { SystemSettingsService } from './system-settings.service';
import { CreateSystemSettingDto } from './dto/create-system-setting.dto';
import { UpdateSystemSettingDto } from './dto/update-system-setting.dto';

@Controller('system-settings')
export class SystemSettingsController {
  constructor(private readonly systemSettingsService: SystemSettingsService) {}

  @Post()
  create(@Body() dto: CreateSystemSettingDto) {
    const userId = 1; // TODO: Lấy từ JWT userId
    return this.systemSettingsService.create(dto, userId);
  }

  @Get()
  findAll() {
    return this.systemSettingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.systemSettingsService.findOne(+id);
  }

  @Get('key/:key')
  findByKey(@Param('key') key: string) {
    return this.systemSettingsService.findByKey(key);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSystemSettingDto) {
    const userId = 1; // TODO: Lấy từ JWT userId
    return this.systemSettingsService.update(+id, dto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.systemSettingsService.remove(+id);
  }
}
