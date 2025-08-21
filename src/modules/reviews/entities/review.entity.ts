import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity';
import { Venue } from '../../venues/entities/venue.entity';
import { User } from 'src/modules/auth/entities/user.entity';
import { ReviewReply } from 'src/modules/review-replies/entities/review-reply.entity';

export enum ReviewStatus {
    ACTIVE = 'active',
    HIDDEN = 'hidden',
    REPORTED = 'reported',
    DELETED = 'deleted',
}

@Entity('reviews')
export class Review {
    @PrimaryGeneratedColumn({ name: 'review_id' })
    reviewId: number;

    @Column({ name: 'booking_id' })
    bookingId: number;

    @ManyToOne(() => Booking)
    @JoinColumn({ name: 'booking_id' })
    booking: Booking;

    @Column({ name: 'customer_id' })
    customerId: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'customer_id' })
    customer: User;

    @Column({ name: 'venue_id' })
    venueId: number;

    @ManyToOne(() => Venue)
    @JoinColumn({ name: 'venue_id' })
    venue: Venue;

    @Column({ type: 'int' })
    rating: number;

    @Column({ type: 'text', nullable: true })
    reviewText: string;

    @Column({ type: 'text', nullable: true })
    pros: string;

    @Column({ type: 'text', nullable: true })
    cons: string;

    @Column({ type: 'json', nullable: true })
    images: string[];

    @Column({ type: 'enum', enum: ReviewStatus, default: ReviewStatus.ACTIVE })
    status: ReviewStatus;

    @Column({ type: 'int', default: 0, name: 'helpful_count' })
    helpfulCount: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => ReviewReply, (reply) => reply.review)
    replies: ReviewReply[];

}
