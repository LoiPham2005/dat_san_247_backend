import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { PricingStrategy } from '../../../common/constants/ai.constant';
import { Venue } from '../../venues/entities/venue.entity';
import { User } from '../../users/entities/user.entity';

@Entity('ai_pricing_suggestions')
export class AIPricingSuggestion extends BaseEntity {
    @Column({ name: 'venue_id' })
    @Index()
    venueId: string;

    @Column({ name: 'owner_id' })
    @Index()
    ownerId: string;

    @Column({ name: 'current_price', type: 'decimal', precision: 15, scale: 2 })
    currentPrice: number;

    @Column({ name: 'suggested_price', type: 'decimal', precision: 15, scale: 2 })
    suggestedPrice: number;

    @Column({ name: 'price_change', type: 'float' })
    priceChange: number;

    @Column({
        type: 'enum',
        enum: PricingStrategy,
    })
    strategy: PricingStrategy;

    @Column({ type: 'jsonb' })
    factors: any;

    @Column({ name: 'predicted_booking_increase', type: 'float', nullable: true })
    predictedBookingIncrease: number;

    @Column({ name: 'predicted_revenue_impact', type: 'decimal', precision: 15, scale: 2, nullable: true })
    predictedRevenueImpact: number;

    @Column({ type: 'float' })
    confidence: number;

    @Column({ name: 'valid_from', type: 'timestamp' })
    validFrom: Date;

    @Column({ name: 'valid_to', type: 'timestamp' })
    validTo: Date;

    @Column({ name: 'is_applied', default: false })
    isApplied: boolean;

    @Column({ name: 'applied_at', type: 'timestamp', nullable: true })
    appliedAt: Date;

    @Column({ name: 'applied_by', nullable: true })
    appliedBy: string;

    @Column({ name: 'actual_bookings', nullable: true })
    actualBookings: number;

    @Column({ name: 'actual_revenue', type: 'decimal', precision: 15, scale: 2, nullable: true })
    actualRevenue: number;

    @ManyToOne(() => Venue)
    @JoinColumn({ name: 'venue_id' })
    venue: Venue;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'owner_id' })
    owner: User;
}
