import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Booking } from '../../bookings/entities/booking.entity';

export enum TransactionType {
    RECHARGE = 'RECHARGE',    // Nạp tiền
    PAYMENT = 'PAYMENT',      // Thanh toán đặt sân
    REFUND = 'REFUND',        // Hoàn tiền khi hủy sân
    PAYOUT = 'PAYOUT',        // Chủ sân rút tiền
    COMMISSION = 'COMMISSION' // Phí hoa hồng cho hệ thống
}

export enum TransactionStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED'
}

@Entity('transactions')
export class Transaction extends BaseEntity {
    @Column({ name: 'user_id', type: 'uuid' })
    @Index()
    userId: string;

    @Column({
        type: 'enum',
        enum: TransactionType,
    })
    @Index()
    type: TransactionType;

    @Column({ type: 'decimal', precision: 15, scale: 2 })
    amount: number;

    @Column({ type: 'decimal', precision: 15, scale: 2, comment: 'Balance after transaction' })
    balanceAfter: number;

    @Column({
        type: 'enum',
        enum: TransactionStatus,
        default: TransactionStatus.PENDING,
    })
    @Index()
    status: TransactionStatus;

    @Column({ name: 'reference_id', nullable: true, comment: 'ID of booking or external payment ID' })
    referenceId: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ name: 'metadata', type: 'jsonb', nullable: true })
    metadata: any;

    @ManyToOne(() => User, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Booking, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'reference_id' })
    booking: Booking;
}
