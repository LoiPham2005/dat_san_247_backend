import { Entity, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Court } from '../../courts/entities/court.entity';

@Entity('booking_waitlist')
export class BookingWaitlist extends BaseEntity {
    @Column({ name: 'user_id', type: 'uuid' })
    @Index()
    userId: string;

    @Column({ name: 'court_id', type: 'uuid' })
    @Index()
    courtId: string;

    @Column({ name: 'booking_date', type: 'date' })
    bookingDate: Date;

    @Column({ name: 'start_time', type: 'time' })
    startTime: string;

    @Column({ name: 'end_time', type: 'time' })
    endTime: string;

    @Column({ name: 'priority', default: 1, comment: 'Higher priority for premium users' })
    priority: number;

    @Column({ name: 'is_notified', default: false })
    isNotified: boolean;

    @Column({ name: 'status', default: 'WAITING' }) // WAITING, CONVERTED, EXPIRED, CANCELLED
    status: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Court, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'court_id' })
    court: Court;
}
