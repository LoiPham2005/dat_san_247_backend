import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { SearchHistoryService } from './search-history.service';
import { CreateSearchHistoryDto } from './dto/create-search-history.dto';
import { UpdateSearchHistoryDto } from './dto/update-search-history.dto';

@Controller('search-history')
export class SearchHistoryController {
  constructor(private readonly service: SearchHistoryService) {}

  @Post()
  create(@Body() createDto: CreateSearchHistoryDto) {
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
  update(@Param('id') id: number, @Body() updateDto: UpdateSearchHistoryDto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}
