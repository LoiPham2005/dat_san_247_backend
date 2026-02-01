import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Venue } from '../../venues/entities/venue.entity';
import { Court } from '../../courts/entities/court.entity';
import { Booking } from './booking.entity';

export enum RepeatType {
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    BIWEEKLY = 'BIWEEKLY',
    MONTHLY = 'MONTHLY'
}

@Entity('recurring_bookings')
export class RecurringBooking extends BaseEntity {
    @Column({ name: 'user_id', type: 'uuid' })
    @Index()
    userId: string;

    @Column({ name: 'venue_id', type: 'uuid' })
    @Index()
    venueId: string;

    @Column({ name: 'court_id', type: 'uuid' })
    courtId: string;

    @Column({
        type: 'enum',
        enum: RepeatType,
        default: RepeatType.WEEKLY
    })
    repeatType: RepeatType;

    @Column({ name: 'days_of_week', type: 'simple-array', nullable: true, comment: '0-6, for weekly repeats. Multiple days supported.' })
    daysOfWeek: number[];

    @Column({ name: 'start_time', type: 'time' })
    startTime: string;

    @Column({ name: 'end_time', type: 'time' })
    endTime: string;

    @Column({ name: 'start_date', type: 'date' })
    startDate: Date;

    @Column({ name: 'end_date', type: 'date', nullable: true })
    endDate: Date;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @Column({ name: 'last_generated_date', type: 'date', nullable: true })
    lastGeneratedDate: Date;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Venue)
    @JoinColumn({ name: 'venue_id' })
    venue: Venue;

    @ManyToOne(() => Court)
    @JoinColumn({ name: 'court_id' })
    court: Court;

    @OneToMany(() => Booking, (booking) => booking.recurringBooking)
    bookings: Booking[];
}
