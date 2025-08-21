import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Post()
  create(@Body() createAuditLogDto: CreateAuditLogDto) {
    return this.auditLogsService.create(createAuditLogDto);
  }

  @Get()
  findAll() {
    return this.auditLogsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.auditLogsService.findOne(id);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.auditLogsService.delete(id);
  }
}
