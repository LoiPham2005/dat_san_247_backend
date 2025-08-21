import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  create(@Body() createDto: CreatePaymentDto) {
    return this.paymentsService.create(createDto);
  }

  @Get()
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.paymentsService.findOne(id);
  }

  @Get('booking/:bookingId')
  findByBooking(@Param('bookingId') bookingId: number) {
    return this.paymentsService.findByBooking(bookingId);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateDto: UpdatePaymentDto) {
    return this.paymentsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.paymentsService.remove(id);
  }
}
