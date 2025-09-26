import { Controller, Post, Body, Get, Param, Patch, Delete, Query } from '@nestjs/common';
import { VenuesService } from './venues.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';

@Controller('venues')
export class VenuesController {
  constructor(
    private readonly venuesService: VenuesService,
  ) { }


  @Get('search')
  search(
    @Query('keyword') keyword: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.venuesService.search(keyword, Number(page), Number(limit));
  }

  @Post()
  async create(@Body() createVenueDto: CreateVenueDto) {
    return this.venuesService.create(createVenueDto);
  }

  // @Get()
  // findAll() {
  //   return this.venuesService.findAll();
  // }

  @Get()
  findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.venuesService.findAll(Number(page), Number(limit));
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

  @Patch(':id/main-image/:imageId')
  setMainImage(
    @Param('id') venueId: number,
    @Param('imageId') imageId: number
  ) {
    return this.venuesService.setMainImage(venueId, imageId);
  }

}
