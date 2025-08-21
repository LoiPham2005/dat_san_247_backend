import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserWallet } from './entities/user-wallet.entity';
import { CreateUserWalletDto } from './dto/create-user-wallet.dto';
import { UpdateUserWalletDto } from './dto/update-user-wallet.dto';
import { success } from 'src/common/helper/response.helper';

@Injectable()
export class UserWalletService {
    constructor(
        @InjectRepository(UserWallet)
        private readonly userWalletRepo: Repository<UserWallet>,
    ) { }

    async create(createDto: CreateUserWalletDto) {
        const wallet = this.userWalletRepo.create(createDto);
        const saved = await this.userWalletRepo.save(wallet);
        return success(saved, 'Tạo ví người dùng thành công');
    }

    async findAll() {
        const wallets = await this.userWalletRepo.find();
        return success(wallets, 'Lấy danh sách ví thành công');
    }

    async findOne(walletId: number) {
        const wallet = await this.userWalletRepo.findOne({ where: { walletId } });
        if (!wallet) throw new NotFoundException('Ví không tồn tại');
        return success(wallet, 'Lấy ví thành công');
    }

    async update(walletId: number, updateDto: UpdateUserWalletDto) {
        const wallet = await this.userWalletRepo.findOne({ where: { walletId } });
        if (!wallet) throw new NotFoundException('Ví không tồn tại');
        Object.assign(wallet, updateDto);
        const updated = await this.userWalletRepo.save(wallet);
        return success(updated, 'Cập nhật ví thành công');
    }

    async remove(walletId: number) {
        const wallet = await this.userWalletRepo.findOne({ where: { walletId } });
        if (!wallet) throw new NotFoundException('Ví không tồn tại');
        const removed = await this.userWalletRepo.remove(wallet);
        return success(removed, 'Xóa ví thành công');
    }
}
