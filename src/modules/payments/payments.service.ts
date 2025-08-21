import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { success } from 'src/common/helper/response.helper';

@Injectable()
export class PaymentsService {
    constructor(
        @InjectRepository(Payment)
        private readonly paymentRepo: Repository<Payment>,
    ) { }

    async create(createDto: CreatePaymentDto) {
        const payment = this.paymentRepo.create(createDto);
        const saved = await this.paymentRepo.save(payment);
        return success(saved, 'Tạo thanh toán thành công');
    }

    async findAll() {
        const payments = await this.paymentRepo.find({
            relations: ['booking'],
            order: { paymentDate: 'DESC' },
        });
        return success(payments, 'Lấy danh sách thanh toán thành công');
    }

    async findOne(paymentId: number) {
        const payment = await this.paymentRepo.findOne({
            where: { paymentId },
            relations: ['booking'],
        });
        return success(payment, 'Lấy chi tiết thanh toán thành công');
    }

    async findByBooking(bookingId: number) {
        const payments = await this.paymentRepo.find({
            where: { bookingId },
            order: { paymentDate: 'DESC' },
        });
        return success(payments, 'Lấy danh sách thanh toán theo booking thành công');
    }

    async update(paymentId: number, updateDto: UpdatePaymentDto) {
        const result = await this.paymentRepo.update({ paymentId }, updateDto);
        return success(result, 'Cập nhật thanh toán thành công');
    }

    async remove(paymentId: number) {
        const result = await this.paymentRepo.delete({ paymentId });
        return success(result, 'Xóa thanh toán thành công');
    }
}
