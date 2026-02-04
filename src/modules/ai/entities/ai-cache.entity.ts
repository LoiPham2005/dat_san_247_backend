import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { AIModel } from './ai-model.entity';

@Entity('ai_cache')
export class AICache extends BaseEntity {
    @Column({ name: 'cache_key', unique: true, comment: 'SHA256 hash of input' })
    @Index()
    cacheKey: string;

    @Column({ name: 'model_id', type: 'uuid', nullable: true })
    @Index()
    modelId: string;

    @Column({ name: 'feature_code', nullable: true })
    @Index()
    featureCode: string;

    // Input & Output
    @Column({ name: 'input_data', type: 'jsonb' })
    inputData: Record<string, any>;

    @Column({ name: 'output_data', type: 'jsonb' })
    outputData: Record<string, any>;

    // Cache metadata
    @Column({ name: 'hit_count', default: 0 })
    hitCount: number;

    @Column({ name: 'last_hit_at', type: 'timestamp', nullable: true })
    lastHitAt: Date;

    @Column({ name: 'tokens_saved', type: 'bigint', default: 0, comment: 'Total tokens saved by cache hits' })
    tokensSaved: number;

    @Column({ name: 'cost_saved', type: 'decimal', precision: 10, scale: 4, default: 0 })
    costSaved: number;

    // TTL
    @Column({ name: 'expires_at', type: 'timestamp' })
    @Index()
    expiresAt: Date;

    @ManyToOne(() => AIModel, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'model_id' })
    model: AIModel;
}
