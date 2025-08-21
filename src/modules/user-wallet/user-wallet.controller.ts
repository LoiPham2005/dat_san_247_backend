import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { UserWalletService } from './user-wallet.service';
import { CreateUserWalletDto } from './dto/create-user-wallet.dto';
import { UpdateUserWalletDto } from './dto/update-user-wallet.dto';

@Controller('user-wallet')
export class UserWalletController {
  constructor(private readonly userWalletService: UserWalletService) {}

  @Post()
  create(@Body() createDto: CreateUserWalletDto) {
    return this.userWalletService.create(createDto);
  }

  @Get()
  findAll() {
    return this.userWalletService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.userWalletService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateDto: UpdateUserWalletDto) {
    return this.userWalletService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.userWalletService.remove(id);
  }
}
