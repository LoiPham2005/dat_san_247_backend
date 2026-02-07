import {
    Entity,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    Index,
    Relation,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Court } from '../../courts/entities/court.entity';
import { Venue } from '../../venues/entities/venue.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { Review } from '../../reviews/entities/review.entity';
import { BookingStatus } from '../../../common/constants/booking-status.constant';
import { RecurringBooking } from './recurring-booking.entity';

@Entity('bookings')
export class Booking extends BaseEntity {
    @Column({ name: 'recurring_booking_id', type: 'uuid', nullable: true })
    recurringBookingId: string;

    @ManyToOne(() => RecurringBooking, (rb) => rb.bookings, { nullable: true })
    @JoinColumn({ name: 'recurring_booking_id' })
    recurringBooking: Relation<RecurringBooking>;

    @Column({ name: 'rescheduled_from_id', type: 'uuid', nullable: true })
    rescheduledFromId: string;

    @ManyToOne(() => Booking, { nullable: true })
    @JoinColumn({ name: 'rescheduled_from_id' })
    rescheduledFrom: Relation<Booking>;

    @Column({ name: 'booking_code', unique: true })
    @Index()
    bookingCode: string;

    @Column({ name: 'check_in_code', unique: true, nullable: true, comment: 'Secure token for QR check-in' })
    @Index()
    checkInCode: string;

    @Column({ name: 'customer_id' })
    @Index()
    customerId: string;

    @Column({ name: 'court_id' })
    @Index()
    courtId: string;

    @Column({ name: 'venue_id' })
    @Index()
    venueId: string;

    @Column({ name: 'booking_date', type: 'date' })
    @Index()
    bookingDate: Date;

    @Column({ name: 'start_time', type: 'time' })
    startTime: string;

    @Column({ name: 'end_time', type: 'time' })
    endTime: string;

    @Column({
        type: 'enum',
        enum: BookingStatus,
        default: BookingStatus.PENDING,
    })
    @Index()
    status: BookingStatus;

    @Column({ name: 'total_hours', type: 'decimal', precision: 4, scale: 2 })
    totalHours: number;

    @Column({ name: 'price_per_hour', type: 'decimal', precision: 10, scale: 2 })
    pricePerHour: number;

    @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
    totalAmount: number;

    @Column({ name: 'sub_total', type: 'decimal', precision: 10, scale: 2, default: 0 })
    subTotal: number;

    @Column({ name: 'vat_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
    vatAmount: number;

    @Column({ name: 'vat_rate', type: 'decimal', precision: 5, scale: 2, default: 0, comment: 'VAT rate applied at booking time' })
    vatRate: number;

    @Column({ name: 'cancellation_deadline', type: 'timestamp', nullable: true, comment: 'Snapshot of policy: latest time for free cancellation' })
    cancellationDeadline: Date;

    @Column({ name: 'commission_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
    commissionAmount: number;

    @Column({ name: 'platform_fee', type: 'decimal', precision: 10, scale: 2, default: 0, comment: 'Extra fee charged to user' })
    platformFee: number;

    @Column({ name: 'deposit_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
    depositAmount: number;

    @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, default: 0, comment: 'Total discount from promotions' })
    discountAmount: number;

    @Column({ name: 'promotion_code', nullable: true, comment: 'Applied promotion code' })
    promotionCode: string;

    @Column({ name: 'refund_amount', type: 'decimal', precision: 10, scale: 2, default: 0, comment: 'Actual amount returned on cancellation' })
    refundAmount: number;

    @Column({ name: 'cancellation_fee', type: 'decimal', precision: 10, scale: 2, default: 0, comment: 'Fee charged for cancelling' })
    cancellationFee: number;


    @Column({ type: 'text', nullable: true })
    note: string;

    @Column({ type: 'jsonb', nullable: true, comment: 'Ad-hoc data like equipment rentals, special requests' })
    metadata: any;

    @Column({ type: 'jsonb', nullable: true, comment: 'AI fraud detection results' })
    fraudAnalysis: {
        riskLevel: string;
        riskScore: number;
        indicators: Record<string, any>;
        actionTaken: string;
        isFalsePositive: boolean;
        reviewedBy: string;
        reviewedAt: Date;
        notes: string;
    };

    @Column({ name: 'checked_in_at', type: 'timestamp', nullable: true })
    checkedInAt: Date;

    @Column({ name: 'checked_in_by', nullable: true })
    checkedInBy: string;

    @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
    cancelledAt: Date;

    @Column({ name: 'cancelled_by', nullable: true })
    cancelledBy: string;

    @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
    cancellationReason: string;

    @ManyToOne(() => User, (user) => user.bookings, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'customer_id' })
    customer: Relation<User>;

    @ManyToOne(() => Court, (court) => court.bookings, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'court_id' })
    court: Relation<Court>;

    @ManyToOne(() => Venue, (venue) => venue.bookings, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'venue_id' })
    venue: Relation<Venue>;

    @OneToMany(() => Payment, (payment) => payment.booking)
    payments: Relation<Payment>[];

    @OneToMany(() => Review, (review) => review.booking)
    reviews: Relation<Review>[];
}
