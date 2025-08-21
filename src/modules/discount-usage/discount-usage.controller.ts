import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { DiscountUsageService } from './discount-usage.service';
import { CreateDiscountUsageDto } from './dto/create-discount-usage.dto';

@Controller('discount-usage')
export class DiscountUsageController {
  constructor(private readonly usageService: DiscountUsageService) {}

  @Post()
  create(@Body() createDto: CreateDiscountUsageDto) {
    return this.usageService.create(createDto);
  }

  @Get()
  findAll() {
    return this.usageService.findAll();
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: number) {
    return this.usageService.findByUser(userId);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.usageService.remove(id);
  }
}
