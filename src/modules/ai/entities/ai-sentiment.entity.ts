import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { SentimentType } from '../../../common/constants/ai.constant';
import { Review } from '../../reviews/entities/review.entity';
import { User } from '../../users/entities/user.entity';

@Entity('ai_sentiment_analyses')
export class AISentimentAnalysis extends BaseEntity {
    @Column({ name: 'source_type' })
    sourceType: 'REVIEW' | 'CHAT' | 'SUPPORT_TICKET' | 'FEEDBACK';

    @Column({ name: 'source_id' })
    @Index()
    sourceId: string;

    @Column({ type: 'text' })
    text: string;

    @Column({
        type: 'enum',
        enum: SentimentType,
    })
    sentiment: SentimentType;

    @Column({ name: 'sentiment_score', type: 'float' })
    sentimentScore: number;

    @Column({ type: 'float' })
    confidence: number;

    @Column({ type: 'jsonb' })
    scores: {
        positive: number;
        neutral: number;
        negative: number;
    };

    @Column({ type: 'jsonb', nullable: true })
    emotions: any;

    @Column({ name: 'key_phrases', type: 'simple-array', nullable: true })
    keyPhrases: string[];

    @Column({ type: 'simple-array', nullable: true })
    topics: string[];

    @Column({ type: 'jsonb', nullable: true })
    issues: any[];

    @Column({ name: 'model_used' })
    modelUsed: string;

    @Column({ name: 'requires_action', default: false })
    requiresAction: boolean;

    @Column({ name: 'suggested_action', type: 'text', nullable: true })
    suggestedAction: string;

    @Column({ name: 'analyzed_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    analyzedAt: Date;

    @ManyToOne(() => Review, { nullable: true })
    @JoinColumn({ name: 'source_id' })
    review: Review;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'user_id' })
    user: User;
}
