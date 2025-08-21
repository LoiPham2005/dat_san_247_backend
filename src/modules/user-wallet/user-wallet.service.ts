import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserWallet } from './entities/user-wallet.entity';
import { CreateUserWalletDto } from './dto/create-user-wallet.dto';
import { UpdateUserWalletDto } from './dto/update-user-wallet.dto';

@Injectable()
export class UserWalletService {
  constructor(
    @InjectRepository(UserWallet)
    private readonly userWalletRepo: Repository<UserWallet>,
  ) {}

  create(createDto: CreateUserWalletDto) {
    const wallet = this.userWalletRepo.create(createDto);
    return this.userWalletRepo.save(wallet);
  }

  findAll() {
    return this.userWalletRepo.find();
  }

  findOne(walletId: number) {
    return this.userWalletRepo.findOne({ where: { walletId } });
  }

  update(walletId: number, updateDto: UpdateUserWalletDto) {
    return this.userWalletRepo.update({ walletId }, updateDto);
  }

  remove(walletId: number) {
    return this.userWalletRepo.delete({ walletId });
  }
}
