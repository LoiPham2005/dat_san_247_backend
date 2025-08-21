import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { VenuesService } from './venues.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';

@Controller('venues')
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  @Post()
  create(@Body() createDto: CreateVenueDto) {
    return this.venuesService.create(createDto);
  }

  @Get()
  findAll() {
    return this.venuesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.venuesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateDto: UpdateVenueDto) {
    return this.venuesService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.venuesService.remove(id);
  }
}
