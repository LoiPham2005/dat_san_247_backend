import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { AIModelVersion } from './ai-model-version.entity';

@Entity('ai_model_metrics')
@Unique(['modelVersionId', 'date'])
export class AIModelMetric extends BaseEntity {
    @Column({ name: 'model_version_id' })
    modelVersionId: string;

    @Column({ type: 'date' })
    date: string;

    @Column({ name: 'total_predictions', type: 'int', nullable: true })
    totalPredictions: number;

    @Column({ name: 'avg_prediction_time_ms', type: 'decimal', precision: 10, scale: 2, nullable: true })
    avgPredictionTimeMs: number;

    @Column({ name: 'correct_predictions', type: 'int', nullable: true })
    correctPredictions: number;

    @Column({ name: 'incorrect_predictions', type: 'int', nullable: true })
    incorrectPredictions: number;

    @Column({ name: 'accuracy_rate', type: 'decimal', precision: 3, scale: 2, nullable: true })
    accuracyRate: number;

    @Column({ name: 'revenue_impact', type: 'decimal', precision: 12, scale: 2, nullable: true })
    revenueImpact: number;

    @Column({ name: 'user_satisfaction_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
    userSatisfactionScore: number;

    @ManyToOne(() => AIModelVersion, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'model_version_id' })
    modelVersion: AIModelVersion;
}
