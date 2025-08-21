import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Venue } from '../../venues/entities/venue.entity';
import { User } from 'src/modules/auth/entities/user.entity';
import { Payment } from 'src/modules/payments/entities/payment.entity';
import { Review } from 'src/modules/reviews/entities/review.entity';

export enum BookingStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    CANCELLED = 'cancelled',
    COMPLETED = 'completed',
    NO_SHOW = 'no_show',
}

export enum PaymentStatus {
    PENDING = 'pending',
    PAID = 'paid',
    REFUNDED = 'refunded',
    FAILED = 'failed',
}

export enum PaymentMethod {
    WALLET = 'wallet',
    CREDIT_CARD = 'credit_card',
    BANK_TRANSFER = 'bank_transfer',
    E_WALLET = 'e_wallet',
    CASH = 'cash',
}

@Entity('bookings')
export class Booking {
    @PrimaryGeneratedColumn({ name: 'booking_id' })
    bookingId: number;

    @Column({ name: 'customer_id' })
    customerId: number;

    @ManyToOne(() => User, (user) => user.bookings)
    @JoinColumn({ name: 'customer_id' })
    customer: User;

    @Column({ name: 'venue_id' })
    venueId: number;

    @ManyToOne(() => Venue, (venue) => venue.bookings)
    @JoinColumn({ name: 'venue_id' })
    venue: Venue;

    @Column({ type: 'date', name: 'booking_date' })
    bookingDate: string;

    @Column({ type: 'time', name: 'start_time' })
    startTime: string;

    @Column({ type: 'time', name: 'end_time' })
    endTime: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_amount' })
    totalAmount: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, name: 'commission_fee' })
    commissionFee: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, name: 'discount_amount', default: 0 })
    discountAmount: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, name: 'final_amount' })
    finalAmount: number;

    @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
    status: BookingStatus;

    @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING, name: 'payment_status' })
    paymentStatus: PaymentStatus;

    @Column({ type: 'enum', enum: PaymentMethod, name: 'payment_method' })
    paymentMethod: PaymentMethod;

    @Column({ name: 'booking_code', length: 20, unique: true })
    bookingCode: string;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ type: 'text', nullable: true, name: 'cancellation_reason' })
    cancellationReason: string;

    @Column({ type: 'timestamp', nullable: true, name: 'cancelled_at' })
    cancelledAt: Date;

    @Column({ type: 'json', nullable: true, name: 'cancellation_policy' })
    cancellationPolicy: any;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => Payment, (payment) => payment.booking)
    payments: Payment[];

    @OneToMany(() => Review, (review) => review.booking)
    reviews: Review[];

}
