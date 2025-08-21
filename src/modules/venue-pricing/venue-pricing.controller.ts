import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { VenuePricingService } from './venue-pricing.service';
import { CreateVenuePricingDto } from './dto/create-venue-pricing.dto';
import { UpdateVenuePricingDto } from './dto/update-venue-pricing.dto';

@Controller('venue-pricing')
export class VenuePricingController {
  constructor(private readonly venuePricingService: VenuePricingService) {}

  @Post()
  create(@Body() createDto: CreateVenuePricingDto) {
    return this.venuePricingService.create(createDto);
  }

  @Get()
  findAll() {
    return this.venuePricingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.venuePricingService.findOne(id);
  }

  @Get('venue/:venueId')
  findByVenue(@Param('venueId') venueId: number) {
    return this.venuePricingService.findByVenue(venueId);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateDto: UpdateVenuePricingDto) {
    return this.venuePricingService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.venuePricingService.remove(id);
  }
}
