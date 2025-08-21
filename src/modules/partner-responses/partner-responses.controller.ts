import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { PartnerResponsesService } from './partner-responses.service';
import { CreatePartnerResponseDto } from './dto/create-partner-response.dto';
import { UpdatePartnerResponseDto } from './dto/update-partner-response.dto';

@Controller('partner-responses')
export class PartnerResponsesController {
  constructor(private readonly service: PartnerResponsesService) {}

  @Post()
  create(@Body() createDto: CreatePartnerResponseDto) {
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

  @Get('by-request/:requestId')
  findByRequest(@Param('requestId') requestId: number) {
    return this.service.findByRequest(requestId);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateDto: UpdatePartnerResponseDto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}
