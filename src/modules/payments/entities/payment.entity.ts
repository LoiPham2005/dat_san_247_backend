import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity';

export enum PaymentMethod {
  WALLET = 'wallet',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  MOMO = 'momo',
  ZALOPAY = 'zalopay',
  VNPAY = 'vnpay',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn({ name: 'payment_id' })
  paymentId: number;

  @Column({ name: 'booking_id' })
  bookingId: number;

  @ManyToOne(() => Booking, (booking) => booking.payments)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ type: 'enum', enum: PaymentMethod, name: 'payment_method' })
  paymentMethod: PaymentMethod;

  @Column({ length: 50, nullable: true, name: 'payment_gateway' })
  paymentGateway: string;

  @Column({ length: 255, nullable: true, name: 'transaction_id' })
  transactionId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ length: 3, default: 'VND' })
  currency: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ type: 'timestamp', nullable: true, name: 'payment_date' })
  paymentDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'refund_amount' })
  refundAmount: number;

  @Column({ type: 'timestamp', nullable: true, name: 'refund_date' })
  refundDate: Date;

  @Column({ type: 'json', nullable: true, name: 'gateway_response' })
  gatewayResponse: any;

  @Column({ type: 'text', nullable: true, name: 'failure_reason' })
  failureReason: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
