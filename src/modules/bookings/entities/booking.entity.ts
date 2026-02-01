import {
    Entity,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    Index,
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
    recurringBooking: RecurringBooking;

    @Column({ name: 'booking_code', unique: true })
    @Index()
    bookingCode: string;

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

    @Column({ name: 'deposit_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
    depositAmount: number;

    @Column({ name: 'customer_name' })
    customerName: string;

    @Column({ name: 'customer_phone' })
    customerPhone: string;

    @Column({ name: 'customer_email', nullable: true })
    customerEmail: string;

    @Column({ type: 'text', nullable: true })
    note: string;

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
    customer: User;

    @ManyToOne(() => Court, (court) => court.bookings, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'court_id' })
    court: Court;

    @ManyToOne(() => Venue, (venue) => venue.bookings, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'venue_id' })
    venue: Venue;

    @OneToMany(() => Payment, (payment) => payment.booking)
    payments: Payment[];

    @OneToMany(() => Review, (review) => review.booking)
    reviews: Review[];
}
