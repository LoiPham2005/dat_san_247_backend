import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { CreateWalletTransactionDto } from './dto/create-wallet-transaction.dto';
import { UpdateWalletTransactionDto } from './dto/update-wallet-transaction.dto';

@Injectable()
export class WalletTransactionsService {
  constructor(
    @InjectRepository(WalletTransaction)
    private readonly walletTxRepo: Repository<WalletTransaction>,
  ) {}

  create(createDto: CreateWalletTransactionDto) {
    const tx = this.walletTxRepo.create(createDto);
    return this.walletTxRepo.save(tx);
  }

  findAll() {
    return this.walletTxRepo.find({ relations: ['user', 'relatedBooking', 'relatedPayment'], order: { createdAt: 'DESC' } });
  }

  findOne(transactionId: number) {
    return this.walletTxRepo.findOne({ where: { transactionId }, relations: ['user', 'relatedBooking', 'relatedPayment'] });
  }

  findByUser(userId: number) {
    return this.walletTxRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  update(transactionId: number, updateDto: UpdateWalletTransactionDto) {
    return this.walletTxRepo.update({ transactionId }, updateDto);
  }

  remove(transactionId: number) {
    return this.walletTxRepo.delete({ transactionId });
  }
}
