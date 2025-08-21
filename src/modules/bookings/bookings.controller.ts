import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@Body() createDto: CreateBookingDto) {
    return this.bookingsService.create(createDto);
  }

  @Get()
  findAll() {
    return this.bookingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.bookingsService.findOne(id);
  }

  @Get('customer/:customerId')
  findByCustomer(@Param('customerId') customerId: number) {
    return this.bookingsService.findByCustomer(customerId);
  }

  @Get('venue/:venueId')
  findByVenue(@Param('venueId') venueId: number) {
    return this.bookingsService.findByVenue(venueId);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateDto: UpdateBookingDto) {
    return this.bookingsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.bookingsService.remove(id);
  }
}
