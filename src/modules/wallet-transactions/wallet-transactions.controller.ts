import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { WalletTransactionsService } from './wallet-transactions.service';
import { CreateWalletTransactionDto } from './dto/create-wallet-transaction.dto';
import { UpdateWalletTransactionDto } from './dto/update-wallet-transaction.dto';

@Controller('wallet-transactions')
export class WalletTransactionsController {
  constructor(private readonly walletTxService: WalletTransactionsService) {}

  @Post()
  create(@Body() createDto: CreateWalletTransactionDto) {
    return this.walletTxService.create(createDto);
  }

  @Get()
  findAll() {
    return this.walletTxService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.walletTxService.findOne(id);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: number) {
    return this.walletTxService.findByUser(userId);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateDto: UpdateWalletTransactionDto) {
    return this.walletTxService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.walletTxService.remove(id);
  }
}
