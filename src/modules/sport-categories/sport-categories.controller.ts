import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { SportCategoriesService } from './sport-categories.service';
import { CreateSportCategoryDto } from './dto/create-sport-category.dto';
import { UpdateSportCategoryDto } from './dto/update-sport-category.dto';

@Controller('sport-categories')
export class SportCategoriesController {
  constructor(private readonly sportCategoriesService: SportCategoriesService) {}

  @Post()
  create(@Body() createDto: CreateSportCategoryDto) {
    return this.sportCategoriesService.create(createDto);
  }

  @Get()
  findAll() {
    return this.sportCategoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.sportCategoriesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateDto: UpdateSportCategoryDto) {
    return this.sportCategoriesService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.sportCategoriesService.remove(id);
  }
}
