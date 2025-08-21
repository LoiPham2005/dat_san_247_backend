import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { DiscountCodesService } from './discount-codes.service';
import { CreateDiscountCodeDto } from './dto/create-discount-code.dto';
import { UpdateDiscountCodeDto } from './dto/update-discount-code.dto';

@Controller('discount-codes')
export class DiscountCodesController {
  constructor(private readonly discountService: DiscountCodesService) {}

  @Post()
  create(@Body() createDto: CreateDiscountCodeDto) {
    return this.discountService.create(createDto);
  }

  @Get()
  findAll() {
    return this.discountService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.discountService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateDto: UpdateDiscountCodeDto) {
    return this.discountService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.discountService.remove(id);
  }
}
