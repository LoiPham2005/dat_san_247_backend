// =====================================================
// 7. PAYMENT ENTITY
// =====================================================
// modules/payments/entities/payment.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { User } from '../../users/entities/user.entity';

export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  MOMO = 'momo',
  ZALOPAY = 'zalopay',
  VNPAY = 'vnpay',
  CREDIT_CARD = 'credit_card',
}

export enum PaymentType {
  DEPOSIT = 'deposit',
  FULL_PAYMENT = 'full_payment',
  REFUND = 'refund',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  PARTIAL = 'partial',
  REFUNDED = 'refunded',
  PAID = 'paid',
}

@Entity('payments')
@Index(['bookingId'])
@Index(['userId'])
@Index(['transactionCode'])
export class Payment extends BaseEntity {
  @Column({ name: 'transaction_code', unique: true, length: 100 })
  transactionCode: string;

  @Column({ name: 'booking_id', type: 'uuid' })
  bookingId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ name: 'payment_method', type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Column({ name: 'payment_type', type: 'enum', enum: PaymentType })
  paymentType: PaymentType;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ name: 'gateway_transaction_id', length: 255, nullable: true })
  gatewayTransactionId?: string;

  @Column({ name: 'gateway_response', type: 'json', nullable: true })
  gatewayResponse?: Record<string, any>;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt?: Date;

  @Column({ name: 'refunded_at', type: 'timestamp', nullable: true })
  refundedAt?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(() => Booking)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}