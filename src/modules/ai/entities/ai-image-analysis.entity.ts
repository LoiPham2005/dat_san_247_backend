import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { ModerationStatus, ContentViolationType } from '../../../common/constants/ai.constant';
import { User } from '../../users/entities/user.entity';

@Entity('ai_image_analysis')
export class AIImageAnalysis extends BaseEntity {
    @Column({ name: 'file_id' })
    @Index()
    fileId: string;

    @Column({ name: 'analysis_type', nullable: true })
    analysisType: string;

    @Column({
        name: 'moderation_status',
        type: 'enum',
        enum: ModerationStatus,
        default: ModerationStatus.PENDING,
    })
    moderationStatus: ModerationStatus;

    @Column({ name: 'has_violations', default: false })
    hasViolations: boolean;

    @Column({ name: 'violation_types', type: 'jsonb', nullable: true })
    violationTypes: any[];

    @Column({ name: 'detected_objects', type: 'jsonb', nullable: true })
    detectedObjects: any[];

    @Column({ name: 'image_quality_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
    imageQualityScore: number;

    @Column({ name: 'is_blurry', nullable: true })
    isBlurry: boolean;

    @Column({ name: 'is_low_resolution', nullable: true })
    isLowResolution: boolean;

    @Column({ name: 'is_stadium_image', nullable: true })
    isStadiumImage: boolean;

    @Column({ name: 'detected_sport_type', nullable: true })
    detectedSportType: string;

    @Column({ name: 'ai_model', nullable: true })
    aiModel: string;

    @Column({ name: 'confidence_scores', type: 'jsonb', nullable: true })
    confidenceScores: Record<string, any>;

    @Column({ name: 'reviewed_by', nullable: true })
    reviewedBy: string;

    @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
    reviewedAt: Date;

    @Column({
        name: 'human_decision',
        type: 'enum',
        enum: ModerationStatus,
        nullable: true,
    })
    humanDecision: ModerationStatus;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'reviewed_by' })
    reviewer: User;
}
