import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
  ) {}

  create(createDto: CreatePaymentDto) {
    const payment = this.paymentRepo.create(createDto);
    return this.paymentRepo.save(payment);
  }

  findAll() {
    return this.paymentRepo.find({ relations: ['booking'], order: { paymentDate: 'DESC' } });
  }

  findOne(paymentId: number) {
    return this.paymentRepo.findOne({ where: { paymentId }, relations: ['booking'] });
  }

  findByBooking(bookingId: number) {
    return this.paymentRepo.find({ where: { bookingId }, order: { paymentDate: 'DESC' } });
  }

  update(paymentId: number, updateDto: UpdatePaymentDto) {
    return this.paymentRepo.update({ paymentId }, updateDto);
  }

  remove(paymentId: number) {
    return this.paymentRepo.delete({ paymentId });
  }
}
