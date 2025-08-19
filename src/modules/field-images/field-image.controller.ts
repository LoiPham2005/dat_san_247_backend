// src/modules/field-images/field-image.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { FieldImageService } from './field-image.service';
import { CreateFieldImageDto } from './dto/create-field-image.dto';
import { UpdateFieldImageDto } from './dto/update-field-image.dto';

@Controller('field-images')
export class FieldImageController {
  constructor(private readonly imageService: FieldImageService) {}

  @Post()
  create(@Body() dto: CreateFieldImageDto) {
    return this.imageService.create(dto);
  }

  @Get()
  findAll() {
    return this.imageService.findAll();
  }

  @Get('field/:fieldId')
  findByField(@Param('fieldId') fieldId: number) {
    return this.imageService.findByField(fieldId);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.imageService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateFieldImageDto) {
    return this.imageService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.imageService.remove(id);
  }
}
