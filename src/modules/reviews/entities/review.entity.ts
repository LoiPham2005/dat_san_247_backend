// =====================================================
// 8. REVIEW ENTITY
// =====================================================
// modules/reviews/entities/review.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Venue } from '../../venues/entities/venue.entity';
import { User } from '../../users/entities/user.entity';
import { Booking } from '../../bookings/entities/booking.entity';

export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  HIDDEN = 'hidden',
}

@Entity('reviews')
@Index(['venueId', 'status', 'rating'])
export class Review extends BaseEntity {
  @Column({ name: 'venue_id', type: 'uuid' })
  venueId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'booking_id', type: 'uuid', nullable: true })
  bookingId?: string;

  @Column()
  rating: number;

  @Column({ name: 'rating_facility', nullable: true })
  ratingFacility?: number;

  @Column({ name: 'rating_service', nullable: true })
  ratingService?: number;

  @Column({ name: 'rating_price', nullable: true })
  ratingPrice?: number;

  @Column({ name: 'rating_location', nullable: true })
  ratingLocation?: number;

  @Column({ name: 'review_title', length: 200, nullable: true })
  reviewTitle?: string;

  @Column({ name: 'review_content', type: 'text', nullable: true })
  reviewContent?: string;

  @Column({ type: 'json', nullable: true })
  images?: string[];

  @Column({ name: 'is_verified_booking', default: false })
  isVerifiedBooking: boolean;

  @Column({ name: 'likes_count', default: 0 })
  likesCount: number;

  @Column({ type: 'enum', enum: ReviewStatus, default: ReviewStatus.PENDING })
  status: ReviewStatus;

  @Column({ name: 'owner_response', type: 'text', nullable: true })
  ownerResponse?: string;

  @Column({ name: 'owner_responded_at', type: 'timestamp', nullable: true })
  ownerRespondedAt?: Date;

  @ManyToOne(() => Venue, (venue) => venue.reviews)
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Booking, { nullable: true })
  @JoinColumn({ name: 'booking_id' })
  booking?: Booking;
}