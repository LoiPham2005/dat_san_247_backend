import { Entity, Column, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { SentimentType } from '../../../common/constants/ai.constant';
import { Review } from '../../reviews/entities/review.entity';

@Entity('ai_review_analysis')
export class AIReviewAnalysis extends BaseEntity {
    @Column({ name: 'review_id', unique: true })
    reviewId: string;

    @Column({
        type: 'enum',
        enum: SentimentType,
    })
    sentiment: SentimentType;

    @Column({ name: 'sentiment_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
    sentimentScore: number;

    @Column({ name: 'detected_topics', type: 'jsonb', nullable: true })
    detectedTopics: any[];

    @Column({ name: 'key_phrases', type: 'jsonb', nullable: true })
    keyPhrases: string[];

    @Column({ name: 'is_spam', default: false })
    isSpam: boolean;

    @Column({ name: 'is_fake', default: false })
    isFake: boolean;

    @Column({ name: 'spam_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
    spamScore: number;

    @Column({ name: 'fake_indicators', type: 'jsonb', nullable: true })
    fakeIndicators: Record<string, any>;

    @Column({ name: 'review_quality_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
    reviewQualityScore: number;

    @Column({ name: 'is_detailed', nullable: true })
    isDetailed: boolean;

    @Column({ name: 'is_helpful', nullable: true })
    isHelpful: boolean;

    @Column({ name: 'ai_model', nullable: true })
    aiModel: string;

    // @OneToOne(() => Review, { onDelete: 'CASCADE' })
    // @JoinColumn({ name: 'review_id' })
    // review: Review;
}
