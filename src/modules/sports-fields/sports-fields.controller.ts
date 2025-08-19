// src/modules/sports-field/sports-field.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SportsFieldService } from './sports-fields.service';
import { CreateSportsFieldDto } from './dto/sports-fields.dto';
import { UpdateSportsFieldDto } from './dto/update-sports-field.dto';

@Controller('sports-fields')
export class SportsFieldController {
  constructor(private readonly sportsFieldService: SportsFieldService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateSportsFieldDto, @Request() req) {
    return this.sportsFieldService.create(dto, req.user);
  }

  @Get()
  findAll() {
    return this.sportsFieldService.findAll();
  }

  @Get('owner/:ownerId')
  findByOwner(@Param('ownerId') ownerId: number) {
    return this.sportsFieldService.findByOwner(ownerId);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.sportsFieldService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateSportsFieldDto) {
    return this.sportsFieldService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.sportsFieldService.remove(id);
  }
}
