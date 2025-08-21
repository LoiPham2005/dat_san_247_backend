import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { User } from 'src/modules/auth/entities/user.entity';

export enum WalletTransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  BOOKING_PAYMENT = 'booking_payment',
  BOOKING_REFUND = 'booking_refund',
  COMMISSION_EARN = 'commission_earn',
  COMMISSION_PAY = 'commission_pay',
}

export enum WalletTransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('wallet_transactions')
export class WalletTransaction {
  @PrimaryGeneratedColumn({ name: 'transaction_id' })
  transactionId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.walletTransactions)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: WalletTransactionType, name: 'transaction_type' })
  transactionType: WalletTransactionType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'balance_before' })
  balanceBefore: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'balance_after' })
  balanceAfter: number;

  @Column({ length: 255, nullable: true })
  description: string;

  @Column({ type: 'int', nullable: true, name: 'related_booking_id' })
  relatedBookingId: number;

  @ManyToOne(() => Booking, { nullable: true })
  @JoinColumn({ name: 'related_booking_id' })
  relatedBooking: Booking;

  @Column({ type: 'int', nullable: true, name: 'related_payment_id' })
  relatedPaymentId: number;

  @ManyToOne(() => Payment, { nullable: true })
  @JoinColumn({ name: 'related_payment_id' })
  relatedPayment: Payment;

  @Column({ type: 'json', nullable: true, name: 'bank_account_info' })
  bankAccountInfo: any;

  @Column({ type: 'enum', enum: WalletTransactionStatus, default: WalletTransactionStatus.PENDING })
  status: WalletTransactionStatus;

  @Column({ type: 'timestamp', nullable: true, name: 'processed_at' })
  processedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
