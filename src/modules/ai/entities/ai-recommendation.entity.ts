import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { RecommendationType } from '../../../common/constants/ai.constant';
import { User } from '../../users/entities/user.entity';

@Entity('ai_recommendations')
export class AIRecommendation extends BaseEntity {
    @Column({ name: 'user_id' })
    @Index()
    userId: string;

    @Column({
        name: 'recommendation_type',
        type: 'enum',
        enum: RecommendationType,
    })
    recommendationType: RecommendationType;

    @Column({ name: 'recommended_item_id' })
    recommendedItemId: string;

    @Column({ name: 'recommended_item_type' })
    recommendedItemType: string;

    @Column({ type: 'decimal', precision: 5, scale: 4 })
    score: number;

    @Column({ type: 'text', nullable: true })
    reason: string;

    @Column({ nullable: true })
    algorithm: string;

    @Column({ name: 'features_used', type: 'jsonb', nullable: true })
    featuresUsed: Record<string, any>;

    @Column({ name: 'is_clicked', default: false })
    isClicked: boolean;

    @Column({ name: 'is_converted', default: false })
    isConverted: boolean;

    @Column({ name: 'clicked_at', type: 'timestamp', nullable: true })
    clickedAt: Date;

    @Column({ name: 'converted_at', type: 'timestamp', nullable: true })
    convertedAt: Date;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
}
