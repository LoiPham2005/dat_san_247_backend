// =====================================================
// 2. BOOKINGS MODULE - Complete Implementation
// =====================================================

// modules/bookings/entities/booking.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { VoucherUsage } from 'src/modules/vouchers/entities/voucher-usage.entity';
import { Payment } from 'src/modules/payments/entities/payment.entity';
import { CommissionRecord } from 'src/modules/commissions/entities/commission-record.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Court } from 'src/modules/courts/entities/court.entity';

export enum BookingStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    PLAYING = 'playing',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    NO_SHOW = 'no_show',
}

export enum PaymentStatus {
    UNPAID = 'unpaid',
    PARTIAL = 'partial',
    PAID = 'paid',
    REFUNDED = 'refunded',
    SUCCESS = 'success',
    FAILED = 'failed',
}

export enum PaymentMethod {
    CASH = 'cash',
    BANK_TRANSFER = 'bank_transfer',
    MOMO = 'momo',
    ZALOPAY = 'zalopay',
    VNPAY = 'vnpay',
    CREDIT_CARD = 'credit_card',
}

@Entity('bookings')
@Index(['userId'])
@Index(['courtId'])
@Index(['bookingDate', 'startTime'])
@Index(['status'])
@Index(['bookingCode'])
export class Booking extends BaseEntity {
    @Column({ name: 'booking_code', unique: true, length: 50 })
    bookingCode: string;

    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @Column({ name: 'court_id', type: 'uuid' })
    courtId: string;

    @Column({ name: 'booking_date', type: 'date' })
    bookingDate: Date;

    @Column({ name: 'start_time', type: 'time' })
    startTime: string;

    @Column({ name: 'end_time', type: 'time' })
    endTime: string;

    @Column({ name: 'duration_minutes' })
    durationMinutes: number;

    @Column({ name: 'price_per_hour', type: 'decimal', precision: 15, scale: 2 })
    pricePerHour: number;

    @Column({ name: 'total_price', type: 'decimal', precision: 15, scale: 2 })
    totalPrice: number;

    @Column({ name: 'deposit_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
    depositAmount: number;

    @Column({ name: 'discount_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
    discountAmount: number;

    @Column({ name: 'final_price', type: 'decimal', precision: 15, scale: 2 })
    finalPrice: number;

    @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
    status: BookingStatus;

    @Column({ name: 'payment_status', type: 'enum', enum: PaymentStatus, default: PaymentStatus.UNPAID })
    paymentStatus: PaymentStatus;

    @Column({ name: 'payment_method', type: 'enum', enum: PaymentMethod, nullable: true })
    paymentMethod?: PaymentMethod;

    @Column({ name: 'customer_name', length: 100 })
    customerName: string;

    @Column({ name: 'customer_phone', length: 20 })
    customerPhone: string;

    @Column({ name: 'customer_email', length: 255, nullable: true })
    customerEmail?: string;

    @Column({ type: 'text', nullable: true })
    notes?: string;

    @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
    cancellationReason?: string;

    @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
    cancelledAt?: Date;

    @Column({ name: 'cancelled_by', type: 'uuid', nullable: true })
    cancelledBy?: string;

    @Column({ name: 'checked_in_at', type: 'timestamp', nullable: true })
    checkedInAt?: Date;

    @Column({ name: 'checked_out_at', type: 'timestamp', nullable: true })
    checkedOutAt?: Date;

    @Column({ nullable: true })
    rating?: number;

    @Column({ type: 'text', nullable: true })
    review?: string;

    @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
    reviewedAt?: Date;

    @OneToMany(() => Payment, (payment) => payment.booking)
    payments: Payment[];

    @OneToMany(() => VoucherUsage, (usage) => usage.booking)
    voucherUsages: VoucherUsage[];

    @OneToMany(() => CommissionRecord, (commission) => commission.booking)
    commissions: CommissionRecord[];

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Court, (court) => court.bookings)
    @JoinColumn({ name: 'court_id' })
    court: Court;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'cancelled_by' })
    canceller?: User;
}