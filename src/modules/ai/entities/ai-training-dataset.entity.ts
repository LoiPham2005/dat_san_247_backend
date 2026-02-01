import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('ai_training_datasets')
export class AITrainingDataset extends BaseEntity {
    @Column({ name: 'dataset_name' })
    datasetName: string;

    @Column({ name: 'dataset_type', nullable: true })
    datasetType: string;

    @Column({ nullable: true })
    version: string;

    @Column({ name: 'total_records', type: 'int', nullable: true })
    totalRecords: number;

    @Column({ name: 'training_split', type: 'decimal', precision: 3, scale: 2, nullable: true })
    trainingSplit: number;

    @Column({ name: 'validation_split', type: 'decimal', precision: 3, scale: 2, nullable: true })
    validationSplit: number;

    @Column({ name: 'test_split', type: 'decimal', precision: 3, scale: 2, nullable: true })
    testSplit: number;

    @Column({ name: 's3_bucket', nullable: true })
    s3Bucket: string;

    @Column({ name: 's3_key', type: 'text', nullable: true })
    s3Key: string;

    @Column({ name: 'features_used', type: 'jsonb', nullable: true })
    featuresUsed: Record<string, any>;

    @Column({ name: 'target_variable', nullable: true })
    targetVariable: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'created_by' })
    createdBy: User;
}
