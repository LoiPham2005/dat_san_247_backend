import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { VenueStatisticsService } from './venue-statistics.service';
import { CreateVenueStatisticDto } from './dto/create-venue-statistic.dto';
import { UpdateVenueStatisticDto } from './dto/update-venue-statistic.dto';

@Controller('venue-statistics')
export class VenueStatisticsController {
  constructor(private readonly service: VenueStatisticsService) {}

  @Post()
  create(@Body() createDto: CreateVenueStatisticDto) {
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
  update(@Param('id') id: number, @Body() updateDto: UpdateVenueStatisticDto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}
