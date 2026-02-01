import {
    Entity,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    Index,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { Venue } from '../../venues/entities/venue.entity';
import { Court } from '../../courts/entities/court.entity';
import { User } from '../../users/entities/user.entity';


@Entity('reviews')
export class Review extends BaseEntity {
    @Column({ name: 'booking_id' })
    bookingId: string;

    @Column({ name: 'venue_id' })
    @Index()
    venueId: string;

    @Column({ name: 'court_id', type: 'uuid', nullable: true })
    @Index()
    courtId: string;

    @Column({ name: 'user_id' })
    @Index()
    userId: string;

    @Column({ type: 'int', comment: 'Overall rating 1-5' })
    rating: number;

    @Column({ name: 'rating_cleanliness', type: 'int', nullable: true })
    ratingCleanliness: number;

    @Column({ name: 'rating_facilities', type: 'int', nullable: true })
    ratingFacilities: number;

    @Column({ name: 'rating_staff', type: 'int', nullable: true })
    ratingStaff: number;

    @Column({ type: 'text', nullable: true })
    comment: string;

    @Column({ type: 'text', nullable: true })
    response: string;

    @Column({ name: 'responded_by', nullable: true })
    respondedBy: string;

    @Column({ name: 'responded_at', type: 'timestamp', nullable: true })
    respondedAt: Date;

    @Column({ name: 'is_visible', default: true })
    isVisible: boolean;

    @ManyToOne(() => Booking, (booking) => booking.reviews, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'booking_id' })
    booking: Booking;

    @ManyToOne(() => Venue, (venue) => venue.reviews, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'venue_id' })
    venue: Venue;

    @ManyToOne(() => Court, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'court_id' })
    court: Court;

    @ManyToOne(() => User, (user) => user.reviews, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;


}
