import {
  Controller, Get, Post, Body, Param, Patch, Delete,
  UseInterceptors, UploadedFile
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SportCategoriesService } from './sport-categories.service';
import { CreateSportCategoryDto } from './dto/create-sport-category.dto';
import { UpdateSportCategoryDto } from './dto/update-sport-category.dto';

@Controller('sport-categories')
export class SportCategoriesController {
  constructor(private readonly service: SportCategoriesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('iconUrl'))
  create(
    @Body() dto: CreateSportCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.service.create(dto, file);
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
  @UseInterceptors(FileInterceptor('iconUrl'))
  update(
    @Param('id') id: number,
    @Body() dto: UpdateSportCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.service.update(id, dto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}
