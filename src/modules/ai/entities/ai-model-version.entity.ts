import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { AITrainingDataset } from './ai-training-dataset.entity';

@Entity('ai_model_versions')
@Unique(['modelName', 'version'])
export class AIModelVersion extends BaseEntity {
    @Column({ name: 'model_name' })
    modelName: string;

    @Column({ name: 'model_type', nullable: true })
    modelType: string;

    @Column()
    version: string;

    @Column({ name: 'dataset_id', nullable: true })
    datasetId: string;

    @Column({ nullable: true })
    algorithm: string;

    @Column({ type: 'jsonb', nullable: true })
    hyperparameters: Record<string, any>;

    @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true })
    accuracy: number;

    @Column({ name: 'precision_score', type: 'decimal', precision: 5, scale: 4, nullable: true })
    precisionScore: number;

    @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true })
    recall: number;

    @Column({ name: 'f1_score', type: 'decimal', precision: 5, scale: 4, nullable: true })
    f1Score: number;

    @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
    rmse: number;

    @Column({ name: 'is_production', default: false })
    isProduction: boolean;

    @Column({ name: 'deployed_at', type: 'timestamp', nullable: true })
    deployedAt: Date;

    @Column({ name: 'model_s3_bucket', nullable: true })
    modelS3Bucket: string;

    @Column({ name: 'model_s3_key', type: 'text', nullable: true })
    modelS3Key: string;

    @ManyToOne(() => AITrainingDataset, { nullable: true })
    @JoinColumn({ name: 'dataset_id' })
    dataset: AITrainingDataset;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'created_by' })
    createdBy: User;
}
