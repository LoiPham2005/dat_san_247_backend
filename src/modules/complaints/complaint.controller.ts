// src/modules/complaints/complaint.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ComplaintService } from './complaint.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';

@Controller('complaints')
export class ComplaintController {
  constructor(private readonly complaintService: ComplaintService) {}

  @Post()
  create(@Body() dto: CreateComplaintDto) {
    return this.complaintService.create(dto);
  }

  @Get()
  findAll() {
    return this.complaintService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.complaintService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateComplaintDto) {
    return this.complaintService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.complaintService.remove(id);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: number) {
    return this.complaintService.findByUser(userId);
  }
}
