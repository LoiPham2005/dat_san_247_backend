import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { RecommendationType, RecommendationSource } from '../../../common/constants/ai.constant';
import { User } from '../../users/entities/user.entity';
import { Booking } from '../../bookings/entities/booking.entity';

@Entity('ai_recommendations')
export class AIRecommendation extends BaseEntity {
    @Column({ name: 'user_id' })
    @Index()
    userId: string;

    @Column({
        type: 'enum',
        enum: RecommendationType,
    })
    type: RecommendationType;

    @Column({
        type: 'enum',
        enum: RecommendationSource,
    })
    source: RecommendationSource;

    @Column({ name: 'item_id' })
    itemId: string;

    @Column({ name: 'item_type' })
    itemType: string;

    @Column({ type: 'float' })
    score: number;

    @Column({ type: 'text', nullable: true })
    reasoning: string;

    @Column({ name: 'context_data', type: 'jsonb', nullable: true })
    contextData: Record<string, any>;

    @Column({ type: 'jsonb', nullable: true })
    factors: any;

    @Column({ name: 'is_viewed', default: false })
    isViewed: boolean;

    @Column({ name: 'viewed_at', type: 'timestamp', nullable: true })
    viewedAt: Date;

    @Column({ name: 'is_clicked', default: false })
    isClicked: boolean;

    @Column({ name: 'clicked_at', type: 'timestamp', nullable: true })
    clickedAt: Date;

    @Column({ name: 'lead_to_booking', default: false })
    leadToBooking: boolean;

    @Column({ name: 'booking_id', nullable: true })
    bookingId: string;

    @Column({ name: 'user_rating', nullable: true })
    userRating: number;

    @Column({ name: 'is_relevant', nullable: true })
    isRelevant: boolean;

    @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
    expiresAt: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Booking, { nullable: true })
    @JoinColumn({ name: 'booking_id' })
    booking: Booking;
}
