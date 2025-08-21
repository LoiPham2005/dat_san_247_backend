import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { CreateWalletTransactionDto } from './dto/create-wallet-transaction.dto';
import { UpdateWalletTransactionDto } from './dto/update-wallet-transaction.dto';
import { success } from 'src/common/helper/response.helper';

@Injectable()
export class WalletTransactionsService {
    constructor(
        @InjectRepository(WalletTransaction)
        private readonly walletTxRepo: Repository<WalletTransaction>,
    ) { }

    async create(createDto: CreateWalletTransactionDto) {
        const tx = this.walletTxRepo.create(createDto);
        const saved = await this.walletTxRepo.save(tx);
        return success(saved, 'Tạo giao dịch thành công');
    }

    async findAll() {
        const txs = await this.walletTxRepo.find({
            relations: ['user', 'relatedBooking', 'relatedPayment'],
            order: { createdAt: 'DESC' }
        });
        return success(txs, 'Lấy danh sách giao dịch thành công');
    }

    async findOne(transactionId: number) {
        const tx = await this.walletTxRepo.findOne({
            where: { transactionId },
            relations: ['user', 'relatedBooking', 'relatedPayment']
        });
        if (!tx) throw new NotFoundException('Giao dịch không tồn tại');
        return success(tx, 'Lấy chi tiết giao dịch thành công');
    }

    async findByUser(userId: number) {
        const txs = await this.walletTxRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' }
        });
        return success(txs, 'Lấy danh sách giao dịch của người dùng thành công');
    }

    async update(transactionId: number, updateDto: UpdateWalletTransactionDto) {
        const tx = await this.walletTxRepo.findOne({ where: { transactionId } });
        if (!tx) throw new NotFoundException('Giao dịch không tồn tại');
        Object.assign(tx, updateDto);
        const updated = await this.walletTxRepo.save(tx);
        return success(updated, 'Cập nhật giao dịch thành công');
    }

    async remove(transactionId: number) {
        const tx = await this.walletTxRepo.findOne({ where: { transactionId } });
        if (!tx) throw new NotFoundException('Giao dịch không tồn tại');
        const removed = await this.walletTxRepo.remove(tx);
        return success(removed, 'Xóa giao dịch thành công');
    }
}
