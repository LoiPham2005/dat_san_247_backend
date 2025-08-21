import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { VenueOperatingHoursService } from './venue-operating-hours.service';
import { CreateVenueOperatingHourDto } from './dto/create-venue-operating-hour.dto';
import { UpdateVenueOperatingHourDto } from './dto/update-venue-operating-hour.dto';

@Controller('venue-operating-hours')
export class VenueOperatingHoursController {
  constructor(private readonly operatingHoursService: VenueOperatingHoursService) {}

  @Post()
  create(@Body() createDto: CreateVenueOperatingHourDto) {
    return this.operatingHoursService.create(createDto);
  }

  @Get()
  findAll() {
    return this.operatingHoursService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.operatingHoursService.findOne(id);
  }

  @Get('venue/:venueId')
  findByVenue(@Param('venueId') venueId: number) {
    return this.operatingHoursService.findByVenue(venueId);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateDto: UpdateVenueOperatingHourDto) {
    return this.operatingHoursService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.operatingHoursService.remove(id);
  }
}
