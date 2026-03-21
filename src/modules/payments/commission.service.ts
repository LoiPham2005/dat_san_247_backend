import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WalletService } from './wallet.service';

@Injectable()
export class CommissionService {
    constructor(
        private prisma: PrismaService,
        private walletService: WalletService
    ) {}

    async getVenueCommissions(ownerId: string, venueId: string) {
        const records = await this.prisma.commission_records.findMany({
            where: {
                venue_id: venueId,
                owner_id: ownerId
            },
            include: {
                bookings: {
                    select: {
                        booking_date: true,
                        start_time: true,
                        end_time: true,
                        status: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        return records.map(r => ({
            ...r,
            booking_amount: Number(r.booking_amount),
            commission_rate: Number(r.commission_rate),
            commission_amount: Number(r.commission_amount),
            owner_receives: Number(r.owner_receives)
        }));
    }

    async getFinancialStats(ownerId: string, venueId: string) {
        const stats = await this.prisma.commission_records.aggregate({
            where: {
                venue_id: venueId,
                owner_id: ownerId
            },
            _sum: {
                booking_amount: true,
                commission_amount: true,
                owner_receives: true
            }
        });

        const wallet = await this.walletService.getWallet(ownerId);

        return {
            totalRevenue: Number(stats._sum.booking_amount || 0),
            totalCommission: Number(stats._sum.commission_amount || 0),
            netIncome: Number(stats._sum.owner_receives || 0),
            availableBalance: Number(wallet.balance),
            pendingPayout: Number(wallet.locked_balance)
        };
    }

    async getAllCommissions() {
        const records = await this.prisma.commission_records.findMany({
            include: {
                venues: {
                    select: { name: true }
                },
                bookings: {
                    select: {
                        booking_code: true,
                        status: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        return records.map(r => ({
            ...r,
            venue_name: (r as any).venues?.name || 'N/A',
            total_amount: Number(r.booking_amount),
            commission_rate: Number(r.commission_rate),
            commission_amount: Number(r.commission_amount),
            owner_receives: Number(r.owner_receives)
        }));
    }
}
