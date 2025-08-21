import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { RefreshTokensService } from './refresh-tokens.service';
import { CreateRefreshTokenDto } from './dto/create-refresh-token.dto';
import { UpdateRefreshTokenDto } from './dto/update-refresh-token.dto';

@Controller('refresh-tokens')
export class RefreshTokensController {
  constructor(private readonly refreshTokensService: RefreshTokensService) {}

  @Post()
  create(@Body() createDto: CreateRefreshTokenDto) {
    return this.refreshTokensService.create(createDto);
  }

  @Get()
  findAll() {
    return this.refreshTokensService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.refreshTokensService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateDto: UpdateRefreshTokenDto) {
    return this.refreshTokensService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.refreshTokensService.remove(id);
  }

  @Patch(':id/revoke')
  revoke(@Param('id') id: number) {
    return this.refreshTokensService.revokeToken(id);
  }
}
