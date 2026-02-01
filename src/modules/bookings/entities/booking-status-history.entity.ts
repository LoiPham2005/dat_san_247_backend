import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Booking } from './booking.entity';
import { BookingStatus } from '../../../common/constants/booking-status.constant';
import { User } from '../../users/entities/user.entity';

@Entity('booking_status_history')
export class BookingStatusHistory extends BaseEntity {
    @Column({ name: 'booking_id', type: 'uuid' })
    @Index()
    bookingId: string;

    @Column({
        type: 'enum',
        enum: BookingStatus,
    })
    status: BookingStatus;

    @Column({ name: 'changed_by', type: 'uuid', nullable: true })
    changedById: string;

    @Column({ type: 'text', nullable: true })
    note: string;

    @ManyToOne(() => Booking, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'booking_id' })
    booking: Booking;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'changed_by' })
    changedBy: User;
}
