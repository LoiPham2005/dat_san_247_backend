import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentFilterDto } from './dto/payment-filter.dto';

@Injectable()
export class PaymentsService {
    constructor(
        private prisma: PrismaService,
    ) { }

    private mapPayment(payment: any) {
        if (!payment) return null;
        return {
            ...payment,
            id: payment.id,
            bookingId: payment.booking_id,
            transactionId: payment.transaction_id,
            amount: payment.amount,
            paymentMethod: payment.payment_method,
            status: payment.status,
            paidAt: payment.paid_at,
            gatewayResponse: payment.gateway_response,
            createdAt: payment.created_at,
            updatedAt: payment.updated_at,
            deletedAt: payment.deleted_at,
            booking: payment.bookings ? {
                ...payment.bookings,
                bookingCode: payment.bookings.booking_code,
                // map other booking fields if needed
            } : null,
        };
    }

    async findAll(filter: PaymentFilterDto) {
        const { page = 1, limit = 10, status, method, search } = filter;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (status) where.status = status;
        if (method) where.payment_method = method;
        if (search) {
            where.OR = [
                { transaction_id: { contains: search, mode: 'insensitive' } },
                { bookings: { booking_code: { contains: search, mode: 'insensitive' } } }
            ];
        }

        const [items, total] = await Promise.all([
            this.prisma.payments.findMany({
                where,
                include: { bookings: true },
                orderBy: { created_at: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.payments.count({ where }),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            items: items.map(p => this.mapPayment(p)),
            meta: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        };
    }

    async getFinancialStats() {
        const result = await this.prisma.payments.aggregate({
            _sum: { amount: true },
            where: { status: 'PAID' as any } // Using string to match enum
        });

        return {
            totalRevenue: Number(result._sum.amount || 0),
        };
    }

    async findAllByOwner(ownerId: string, filter: PaymentFilterDto) {
        const { page = 1, limit = 10, status, search } = filter;
        const skip = (page - 1) * limit;

        const where: any = {
            bookings: {
                venues: {
                    owner_id: ownerId
                }
            }
        };

        if (status) where.status = status;
        if (search) {
            where.bookings.booking_code = { contains: search, mode: 'insensitive' };
        }

        const [items, total] = await Promise.all([
            this.prisma.payments.findMany({
                where,
                include: {
                    bookings: {
                        include: { venues: true }
                    }
                },
                orderBy: { created_at: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.payments.count({ where }),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            items: items.map(p => this.mapPayment(p)),
            meta: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
        };
    }

    async getOwnerRevenueStats(ownerId: string) {
        const where = {
            bookings: { venues: { owner_id: ownerId } },
            status: 'PAID' as any
        };

        const result = await this.prisma.payments.aggregate({
            _sum: { amount: true },
            _count: { id: true },
            where
        });

        return {
            totalRevenue: Number(result._sum.amount || 0),
            totalTransactions: Number(result._count.id || 0),
        };
    }

    async getWalletHistory(userId: string) {
        // Logic lấy lịch sử nạp/rút/thanh toán của user
        // Assuming transactions model usage if implemented
        return [];
    }

    async createTopUpTransaction(userId: string, data: any) {
        // Logic khởi tạo giao dịch nạp tiền qua gateway
        return { paymentUrl: 'https://gateway.com/pay' };
    }
}
