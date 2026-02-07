import { Entity, Column, ManyToOne, JoinColumn, Index, Relation } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { AIModel } from './ai-model.entity';
import { User } from '../../users/entities/user.entity';

export enum InteractionType {
    CHAT = 'CHAT',
    COMPLETION = 'COMPLETION',
    VISION_ANALYSIS = 'VISION_ANALYSIS',
    EMBEDDING = 'EMBEDDING',
    CLASSIFICATION = 'CLASSIFICATION',
    PREDICTION = 'PREDICTION',
    RECOMMENDATION = 'RECOMMENDATION',
    MODERATION = 'MODERATION',
    CUSTOM = 'CUSTOM',
}

export enum InteractionStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED',
    TIMEOUT = 'TIMEOUT',
}

@Entity('ai_interactions')
export class AIInteraction extends BaseEntity {
    @Column({ name: 'model_id', type: 'uuid' })
    @Index()
    modelId: string;

    @Column({
        type: 'enum',
        enum: InteractionType,
    })
    @Index()
    type: InteractionType;

    @Column({ name: 'user_id', type: 'uuid', nullable: true })
    @Index()
    userId: string;

    @Column({ name: 'session_id', nullable: true })
    @Index()
    sessionId: string;

    // Entity context (UNIVERSAL - works with ANY entity)
    @Column({ name: 'entity_type', nullable: true, comment: 'venue, booking, review, user, etc.' })
    @Index()
    entityType: string;

    @Column({ name: 'entity_id', type: 'uuid', nullable: true })
    @Index()
    entityId: string;

    // Input
    @Column({ name: 'input_data', type: 'jsonb', comment: 'Flexible input: text, image_url, structured_data' })
    inputData: {
        text?: string;
        messages?: Array<{ role: string; content: string }>;
        imageUrl?: string;
        fileUrl?: string;
        structuredData?: Record<string, any>;
    };

    @Column({ name: 'input_tokens', nullable: true })
    inputTokens: number;

    // Output
    @Column({ name: 'output_data', type: 'jsonb', nullable: true, comment: 'Flexible output: text, json, scores' })
    outputData: {
        text?: string;
        json?: Record<string, any>;
        scores?: Record<string, number>;
        embeddings?: number[];
        choices?: any[];
    };

    @Column({ name: 'output_tokens', nullable: true })
    outputTokens: number;

    // Model configuration used
    @Column({ name: 'model_config', type: 'jsonb', nullable: true })
    modelConfig: {
        temperature?: number;
        topP?: number;
        maxTokens?: number;
        [key: string]: any;
    };

    // Performance
    @Column({ name: 'latency_ms', nullable: true })
    latencyMs: number;

    @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
    cost: number;

    // Status & Error
    @Column({
        type: 'enum',
        enum: InteractionStatus,
        default: InteractionStatus.PENDING,
    })
    @Index()
    status: InteractionStatus;

    @Column({ name: 'error_message', type: 'text', nullable: true })
    errorMessage: string;

    @Column({ name: 'error_code', nullable: true })
    errorCode: string;

    @Column({ name: 'retry_count', default: 0 })
    retryCount: number;

    // Timestamps
    @Column({ name: 'started_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    startedAt: Date;

    @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
    completedAt: Date;

    // Relations
    @ManyToOne(() => AIModel, (model) => model.interactions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'model_id' })
    model: Relation<AIModel>;

    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'user_id' })
    user: Relation<User>;
}
