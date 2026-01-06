import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { PaymentMethod } from '../../../common/constants/payment-method.constant';
import { PaymentStatus } from '../../../common/constants/payment-status.constant';

@Entity('payments')
export class Payment extends BaseEntity {
    @Column({ name: 'booking_id' })
    @Index()
    bookingId: string;

    @Column({ name: 'transaction_id', unique: true, nullable: true })
    @Index()
    transactionId: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column({
        name: 'payment_method',
        type: 'enum',
        enum: PaymentMethod,
    })
    paymentMethod: PaymentMethod;

    @Column({
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.PENDING,
    })
    @Index()
    status: PaymentStatus;

    @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
    paidAt: Date;

    @Column({ name: 'refunded_at', type: 'timestamp', nullable: true })
    refundedAt: Date;

    @Column({ name: 'refund_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
    refundAmount: number;

    @Column({ name: 'gateway_response', type: 'jsonb', nullable: true })
    gatewayResponse: any;

    @ManyToOne(() => Booking, (booking) => booking.payments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'booking_id' })
    booking: Booking;
}
