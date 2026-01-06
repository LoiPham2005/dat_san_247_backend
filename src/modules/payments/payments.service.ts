import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentFilterDto } from './dto/payment-filter.dto';

@Injectable()
export class PaymentsService {
    constructor(
        @InjectRepository(Payment)
        private paymentRepository: Repository<Payment>,
    ) { }

    async findAll(filter: PaymentFilterDto) {
        const { page = 1, limit = 10, status, method, search } = filter;
        const skip = (page - 1) * limit;

        const query = this.paymentRepository.createQueryBuilder('payment')
            .leftJoinAndSelect('payment.booking', 'booking');

        if (status) query.andWhere('payment.status = :status', { status });
        if (method) query.andWhere('payment.paymentMethod = :method', { method });
        if (search) {
            query.andWhere(
                '(payment.transactionId ILIKE :search OR booking.bookingCode ILIKE :search)',
                { search: `%${search}%` },
            );
        }

        const [items, total] = await query
            .orderBy('payment.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        const totalPages = Math.ceil(total / limit);

        return {
            items,
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
        const totalRevenue = await this.paymentRepository
            .createQueryBuilder('payment')
            .select('SUM(payment.amount)', 'total')
            .where('payment.status = :status', { status: 'PAID' })
            .getRawOne();

        return {
            totalRevenue: parseFloat(totalRevenue?.total || 0),
            // Thêm các chỉ số khác như doanh thu tháng này, tuần này...
        };
    }

    async findAllByOwner(ownerId: string, filter: PaymentFilterDto) {
        const { page = 1, limit = 10, status, search } = filter;
        const skip = (page - 1) * limit;

        const query = this.paymentRepository.createQueryBuilder('payment')
            .innerJoin('payment.booking', 'booking')
            .innerJoin('booking.venue', 'venue')
            .where('venue.ownerId = :ownerId', { ownerId });

        if (status) query.andWhere('payment.status = :status', { status });
        if (search) query.andWhere('booking.bookingCode ILIKE :search', { search: `%${search}%` });

        const [items, total] = await query
            .orderBy('payment.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        const totalPages = Math.ceil(total / limit);

        return {
            items,
            meta: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
        };
    }

    async getOwnerRevenueStats(ownerId: string) {
        const stats = await this.paymentRepository.createQueryBuilder('payment')
            .innerJoin('payment.booking', 'booking')
            .innerJoin('booking.venue', 'venue')
            .select('SUM(payment.amount)', 'total')
            .addSelect('COUNT(payment.id)', 'count')
            .where('venue.ownerId = :ownerId', { ownerId })
            .andWhere('payment.status = :status', { status: 'PAID' })
            .getRawOne();

        return {
            totalRevenue: parseFloat(stats?.total || 0),
            totalTransactions: parseInt(stats?.count || 0),
        };
    }

    async getWalletHistory(userId: string) {
        // Logic lấy lịch sử nạp/rút/thanh toán của user
        return [];
    }

    async createTopUpTransaction(userId: string, data: any) {
        // Logic khởi tạo giao dịch nạp tiền qua gateway
        return { paymentUrl: 'https://gateway.com/pay' };
    }
}
