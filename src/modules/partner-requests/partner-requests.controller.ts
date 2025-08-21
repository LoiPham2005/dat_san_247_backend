import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
import { PartnerRequestsService } from './partner-requests.service';
import { CreatePartnerRequestDto } from './dto/create-partner-request.dto';
import { UpdatePartnerRequestDto } from './dto/update-partner-request.dto';

@Controller('partner-requests')
export class PartnerRequestsController {
  constructor(private readonly service: PartnerRequestsService) {}

  @Post()
  create(@Body() createDto: CreatePartnerRequestDto) {
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
  update(@Param('id') id: number, @Body() updateDto: UpdatePartnerRequestDto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}
