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
import { User } from '../../users/entities/user.entity';
import { ReviewImage } from './review-image.entity';

@Entity('reviews')
export class Review extends BaseEntity {
    @Column({ name: 'booking_id' })
    bookingId: string;

    @Column({ name: 'venue_id' })
    @Index()
    venueId: string;

    @Column({ name: 'user_id' })
    @Index()
    userId: string;

    @Column({ type: 'int' })
    rating: number;

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

    @ManyToOne(() => User, (user) => user.reviews, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToMany(() => ReviewImage, (image) => image.review)
    images: ReviewImage[];
}
