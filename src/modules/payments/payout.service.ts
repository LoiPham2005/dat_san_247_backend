import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WalletService } from './wallet.service';

@Injectable()
export class PayoutService {
    constructor(
        private prisma: PrismaService,
        private walletService: WalletService
    ) {}

    async getBankAccounts(userId: string) {
        const wallet = await this.walletService.getWallet(userId);
        return this.prisma.payout_bank_accounts.findMany({
            where: { wallet_id: wallet.id },
            orderBy: { created_at: 'desc' }
        });
    }

    async addBankAccount(userId: string, data: any) {
        const wallet = await this.walletService.getWallet(userId);
        
        // If first account, set as default
        const count = await this.prisma.payout_bank_accounts.count({
            where: { wallet_id: wallet.id }
        });

        if (data.is_default && count > 0) {
            await this.prisma.payout_bank_accounts.updateMany({
                where: { wallet_id: wallet.id },
                data: { is_default: false }
            });
        }

        return this.prisma.payout_bank_accounts.create({
            data: {
                wallet_id: wallet.id,
                bank_name: data.bank_name,
                bank_code: data.bank_code || data.bank_name,
                account_number: data.account_number,
                account_name: data.account_name,
                is_default: data.is_default || count === 0
            }
        });
    }

    async deleteBankAccount(userId: string, id: string) {
        const wallet = await this.walletService.getWallet(userId);
        const account = await this.prisma.payout_bank_accounts.findUnique({
            where: { id }
        });

        if (!account || account.wallet_id !== wallet.id) {
            throw new NotFoundException('Không tìm thấy tài khoản ngân hàng');
        }

        return this.prisma.payout_bank_accounts.delete({
            where: { id }
        });
    }

    async getPayoutRequests(userId: string) {
        const payouts = await this.prisma.payout_requests.findMany({
            where: { user_id: userId },
            include: {
                bank_account: {
                    select: {
                        bank_name: true,
                        account_number: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        return payouts.map(p => ({
            ...p,
            amount: Number(p.amount)
        }));
    }

    async createPayoutRequest(userId: string, amount: number, bankAccountId: string) {
        const wallet = await this.walletService.getWallet(userId);

        if (Number(wallet.balance) < amount) {
            throw new BadRequestException('Số dư khả dụng không đủ để thực hiện yêu cầu này');
        }

        if (amount < 100000) {
            throw new BadRequestException('Số tiền rút tối thiểu là 100,000đ');
        }

        // Use transaction to update wallet and create request
        return this.prisma.$transaction(async (tx) => {
            // Update wallet balances
            await tx.wallets.update({
                where: { id: wallet.id },
                data: {
                    balance: { decrement: amount },
                    locked_balance: { increment: amount }
                }
            });

            // Create payout request
            return tx.payout_requests.create({
                data: {
                    user_id: userId,
                    amount: amount,
                    bank_account_id: bankAccountId,
                    status: 'PENDING'
                }
            });
        });
    }

    async getAllPayoutRequests() {
        const payouts = await this.prisma.payout_requests.findMany({
            include: {
                users: {
                    select: {
                        full_name: true,
                        email: true,
                        owned_venues: {
                            select: { name: true },
                            take: 1
                        }
                    }
                },
                bank_account: {
                    select: {
                        bank_name: true,
                        account_number: true,
                        account_name: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        return payouts.map(p => ({
            ...p,
            owner_name: (p as any).users.full_name,
            owner_email: (p as any).users.email,
            venue_name: (p as any).users.owned_venues[0]?.name || 'Chưa có sân',
            bank_name: (p as any).bank_account.bank_name,
            bank_account_number: (p as any).bank_account.account_number,
            bank_account_name: (p as any).bank_account.account_name,
            amount: Number(p.amount)
        }));
    }

    async updatePayoutStatus(id: string, status: any, adminId: string) {
        const payout = await this.prisma.payout_requests.findUnique({
            where: { id },
            include: { users: { include: { wallet: true } } }
        });

        if (!payout) throw new NotFoundException('Không tìm thấy yêu cầu rút tiền');

        return this.prisma.$transaction(async (tx) => {
            // If COMPLETED: The amount was already moved balance -> locked_balance on creation.
            // Now we just decrease locked_balance for real.
            if (status === 'COMPLETED') {
                await tx.wallets.update({
                    where: { user_id: payout.user_id },
                    data: {
                        locked_balance: { decrement: payout.amount }
                    }
                });
            }

            // If REJECTED: Move money back from locked_balance -> balance
            if (status === 'REJECTED') {
                await tx.wallets.update({
                    where: { user_id: payout.user_id },
                    data: {
                        locked_balance: { decrement: payout.amount },
                        balance: { increment: payout.amount }
                    }
                });
            }

            return tx.payout_requests.update({
                where: { id },
                data: {
                    status,
                    processed_at: new Date(),
                    processed_by: adminId
                }
            });
        });
    }
}
