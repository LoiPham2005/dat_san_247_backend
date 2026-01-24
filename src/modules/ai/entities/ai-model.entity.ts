import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { TrainingDataType, ModelStatus, ImageAnalysisType } from '../../../common/constants/ai.constant';
import { User } from '../../users/entities/user.entity';

@Entity('ai_training_data')
export class AITrainingData extends BaseEntity {
    @Column({
        type: 'enum',
        enum: TrainingDataType,
    })
    type: TrainingDataType;

    @Column({ type: 'text' })
    input: string;

    @Column({ type: 'text' })
    output: string;

    @Column({ type: 'jsonb', nullable: true })
    context: Record<string, any>;

    @Column({ name: 'is_verified', default: false })
    isVerified: boolean;

    @Column({ name: 'verified_by', nullable: true })
    verifiedBy: string;

    @Column({ default: 'MEDIUM' })
    quality: 'LOW' | 'MEDIUM' | 'HIGH';

    @Column({ name: 'source_type' })
    sourceType: 'HUMAN_ANNOTATION' | 'USER_FEEDBACK' | 'AUTO_GENERATED';

    @Column({ name: 'source_id', nullable: true })
    sourceId: string;

    @Column({ name: 'is_used_in_training', default: false })
    isUsedInTraining: boolean;

    @Column({ name: 'used_in_model_version', nullable: true })
    usedInModelVersion: string;

    @Column({ type: 'simple-array', nullable: true })
    tags: string[];

    @Column({ nullable: true })
    category: string;

    @Column({ name: 'created_by' })
    createdBy: string;
}

@Entity('ai_models')
export class AIModel extends BaseEntity {
    @Column()
    name: string;

    @Column()
    version: string;

    @Column()
    type: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column()
    provider: 'OPENAI' | 'ANTHROPIC' | 'GEMINI' | 'CUSTOM' | 'FINE_TUNED';

    @Column({ name: 'base_model', nullable: true })
    baseModel: string;

    @Column({ type: 'jsonb' })
    config: Record<string, any>;

    @Column({ name: 'training_data_count', default: 0 })
    trainingDataCount: number;

    @Column({ name: 'training_started_at', type: 'timestamp', nullable: true })
    trainingStartedAt: Date;

    @Column({ name: 'training_completed_at', type: 'timestamp', nullable: true })
    trainingCompletedAt: Date;

    @Column({ name: 'training_duration', nullable: true })
    trainingDuration: number;

    @Column({ type: 'jsonb', nullable: true })
    metrics: any;

    @Column({
        type: 'enum',
        enum: ModelStatus,
        default: ModelStatus.ACTIVE,
    })
    status: ModelStatus;

    @Column({ name: 'deployed_at', type: 'timestamp', nullable: true })
    deployedAt: Date;

    @Column({ name: 'total_inferences', default: 0 })
    totalInferences: number;

    @Column({ name: 'average_latency', default: 0 })
    averageLatency: number;

    @Column({ name: 'error_rate', type: 'float', default: 0 })
    errorRate: number;

    @Column({ name: 'previous_version_id', nullable: true })
    previousVersionId: string;

    @Column({ name: 'created_by' })
    createdBy: string;
}
