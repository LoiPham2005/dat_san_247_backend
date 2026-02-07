import { Entity, Column, ManyToOne, JoinColumn, Index, Relation } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Venue } from '../../venues/entities/venue.entity';
import { Court } from '../../courts/entities/court.entity';
import { Promotion } from '../../promotions/entities/promotion.entity';

export enum RecommendationType {
    VENUE = 'VENUE',
    COURT = 'COURT',
    TIME_SLOT = 'TIME_SLOT',
    PROMOTION = 'PROMOTION',
    SIMILAR_USER = 'SIMILAR_USER',
    TEAM = 'TEAM',
    MATCH_OPPONENT = 'MATCH_OPPONENT',
}

export enum RecommendationAlgorithm {
    COLLABORATIVE_FILTERING = 'COLLABORATIVE_FILTERING',
    CONTENT_BASED = 'CONTENT_BASED',
    HYBRID = 'HYBRID',
    POPULARITY_BASED = 'POPULARITY_BASED',
    LOCATION_BASED = 'LOCATION_BASED',
    TIME_BASED = 'TIME_BASED',
    DEEP_LEARNING = 'DEEP_LEARNING',
}

@Entity('ai_recommendations')
export class AIRecommendation extends BaseEntity {
    @Column({ name: 'user_id', type: 'uuid' })
    @Index()
    userId: string;

    @Column({
        name: 'recommendation_type',
        type: 'enum',
        enum: RecommendationType,
    })
    @Index()
    recommendationType: RecommendationType;

    // Polymorphic recommended item
    @Column({ name: 'recommended_item_id', type: 'uuid' })
    recommendedItemId: string;

    @Column({ name: 'recommended_item_type', length: 50 })
    recommendedItemType: string; // 'venue', 'court', 'promotion', 'user', 'team'

    // Scoring
    @Column({ type: 'decimal', precision: 5, scale: 4, comment: 'Recommendation confidence score 0.0000 - 1.0000' })
    score: number;

    @Column({ type: 'text', nullable: true, comment: 'Human-readable explanation of why this was recommended' })
    reason: string;

    @Column({
        type: 'enum',
        enum: RecommendationAlgorithm,
    })
    algorithm: RecommendationAlgorithm;

    @Column({ type: 'jsonb', nullable: true, comment: 'Features used for recommendation' })
    featuresUsed: {
        sportPreference?: string[];
        locationPreference?: { city: string; district: string };
        priceRange?: { min: number; max: number };
        timePreference?: string[];
        similarUsers?: string[];
        userHistory?: string[];
        popularityScore?: number;
        distanceKm?: number;
    };

    // Tracking effectiveness
    @Column({ name: 'is_clicked', default: false })
    isClicked: boolean;

    @Column({ name: 'is_converted', default: false, comment: 'Did user actually book/follow the recommendation?' })
    isConverted: boolean;

    @Column({ name: 'clicked_at', type: 'timestamp', nullable: true })
    clickedAt: Date;

    @Column({ name: 'converted_at', type: 'timestamp', nullable: true })
    convertedAt: Date;

    @Column({ name: 'display_position', nullable: true, comment: 'Position in recommendation list (1-indexed)' })
    displayPosition: number;

    @Column({ name: 'session_id', nullable: true })
    sessionId: string;

    // Relations
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: Relation<User>;

    // Optional specific relations (for easier querying)
    @Column({ name: 'venue_id', type: 'uuid', nullable: true })
    venueId: string;

    @Column({ name: 'court_id', type: 'uuid', nullable: true })
    courtId: string;

    @Column({ name: 'promotion_id', type: 'uuid', nullable: true })
    promotionId: string;

    @ManyToOne(() => Venue, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'venue_id' })
    venue: Relation<Venue>;

    @ManyToOne(() => Court, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'court_id' })
    court: Relation<Court>;

    @ManyToOne(() => Promotion, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'promotion_id' })
    promotion: Relation<Promotion>;
}
