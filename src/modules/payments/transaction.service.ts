import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TransactionService {
    constructor(private prisma: PrismaService) {}

    async getTransactions(userId: string) {
        return this.prisma.transactions.findMany({
            where: { user_id: userId },
            include: {
                bookings: {
                    select: {
                        booking_code: true,
                        venues: {
                            select: { name: true }
                        }
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });
    }

    async getAllTransactions() {
        const txns = await this.prisma.transactions.findMany({
            include: {
                bookings: {
                    select: {
                        booking_code: true,
                        venues: {
                            select: { name: true }
                        }
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        return txns.map(t => ({
            ...t,
            reference_id: t.bookings?.booking_code || t.id,
            venue_name: (t.bookings as any)?.venues?.name || 'N/A',
            amount: Number(t.amount),
        }));
    }
}
