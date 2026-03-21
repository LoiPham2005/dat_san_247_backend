import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WalletService {
    constructor(private prisma: PrismaService) {}

    async getWallet(userId: string) {
        let wallet = await this.prisma.wallets.findUnique({
            where: { user_id: userId }
        });

        if (!wallet) {
            wallet = await this.prisma.wallets.create({
                data: {
                    user_id: userId,
                    balance: 0,
                    locked_balance: 0,
                    is_active: true
                }
            });
        }

        return wallet;
    }
}
