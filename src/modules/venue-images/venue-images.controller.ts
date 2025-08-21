import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { VenueImagesService } from './venue-images.service';
import { CreateVenueImageDto } from './dto/create-venue-image.dto';
import { UpdateVenueImageDto } from './dto/update-venue-image.dto';

@Controller('venue-images')
export class VenueImagesController {
  constructor(private readonly venueImagesService: VenueImagesService) {}

  @Post()
  create(@Body() createDto: CreateVenueImageDto) {
    return this.venueImagesService.create(createDto);
  }

  @Get()
  findAll() {
    return this.venueImagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.venueImagesService.findOne(id);
  }

  @Get('venue/:venueId')
  findByVenue(@Param('venueId') venueId: number) {
    return this.venueImagesService.findByVenue(venueId);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateDto: UpdateVenueImageDto) {
    return this.venueImagesService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.venueImagesService.remove(id);
  }
}
