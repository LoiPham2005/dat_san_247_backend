// src/modules/field-availability/field-availability.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { FieldAvailabilityService } from './field-availability.service';
import { CreateFieldAvailabilityDto } from './dto/create-field-availability.dto';
import { UpdateFieldAvailabilityDto } from './dto/update-field-availability.dto';

@Controller('field-availabilities')
export class FieldAvailabilityController {
  constructor(private readonly service: FieldAvailabilityService) {}

  @Post()
  create(@Body() dto: CreateFieldAvailabilityDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateFieldAvailabilityDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }

  @Get('field/:fieldId')
  findByField(@Param('fieldId') fieldId: number) {
    return this.service.findByField(fieldId);
  }
}
