import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';

export enum AIModelType {
    LLM = 'LLM', // Large Language Model (ChatGPT, Claude, Gemini)
    VISION = 'VISION', // Computer Vision
    EMBEDDING = 'EMBEDDING', // Text/Image Embeddings
    CLASSIFICATION = 'CLASSIFICATION', // ML Classification
    REGRESSION = 'REGRESSION', // ML Regression
    RECOMMENDATION = 'RECOMMENDATION', // Recommendation System
    FORECASTING = 'FORECASTING', // Time Series Forecasting
    ANOMALY = 'ANOMALY', // Anomaly Detection
    NLP = 'NLP', // Natural Language Processing
    CUSTOM = 'CUSTOM', // Custom Models
}

export enum AIProvider {
    OPENAI = 'OPENAI',
    ANTHROPIC = 'ANTHROPIC',
    GOOGLE = 'GOOGLE',
    AWS = 'AWS',
    AZURE = 'AZURE',
    COHERE = 'COHERE',
    HUGGINGFACE = 'HUGGINGFACE',
    CUSTOM = 'CUSTOM',
    SELF_HOSTED = 'SELF_HOSTED',
}

export enum ModelStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    DEPRECATED = 'DEPRECATED',
    TESTING = 'TESTING',
}

@Entity('ai_models')
export class AIModel extends BaseEntity {
    @Column({ unique: true })
    @Index()
    name: string; // gpt-4-turbo, claude-sonnet-4, gemini-pro

    @Column({ name: 'display_name', nullable: true })
    displayName: string; // GPT-4 Turbo, Claude Sonnet 4

    @Column({ nullable: true })
    version: string; // 0.1.0, 2024-01-01

    @Column({
        type: 'enum',
        enum: AIModelType,
    })
    @Index()
    type: AIModelType;

    @Column({
        type: 'enum',
        enum: AIProvider,
    })
    @Index()
    provider: AIProvider;

    @Column({ name: 'api_endpoint', type: 'text', nullable: true })
    apiEndpoint: string;

    @Column({ name: 'api_key_name', nullable: true, comment: 'ENV variable name: OPENAI_API_KEY' })
    apiKeyName: string;

    @Column({ type: 'jsonb', nullable: true, comment: 'Model capabilities: vision, function_calling, streaming' })
    capabilities: {
        vision?: boolean;
        functionCalling?: boolean;
        streaming?: boolean;
        jsonMode?: boolean;
        multimodal?: boolean;
    };

    // Limits & Costs
    @Column({ name: 'max_tokens', nullable: true })
    maxTokens: number;

    @Column({ name: 'max_context_length', nullable: true })
    maxContextLength: number;

    @Column({ name: 'cost_per_1k_input_tokens', type: 'decimal', precision: 10, scale: 6, nullable: true })
    costPer1kInputTokens: number;

    @Column({ name: 'cost_per_1k_output_tokens', type: 'decimal', precision: 10, scale: 6, nullable: true })
    costPer1kOutputTokens: number;

    @Column({ name: 'rate_limit_rpm', nullable: true, comment: 'Requests per minute' })
    rateLimitRpm: number;

    @Column({ name: 'rate_limit_tpm', nullable: true, comment: 'Tokens per minute' })
    rateLimitTpm: number;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ name: 'documentation_url', type: 'text', nullable: true })
    documentationUrl: string;

    @Column({ name: 'default_config', type: 'jsonb', nullable: true, comment: 'Default model configuration' })
    defaultConfig: {
        temperature?: number;
        topP?: number;
        maxTokens?: number;
        frequencyPenalty?: number;
        presencePenalty?: number;
    };

    @Column({
        type: 'enum',
        enum: ModelStatus,
        default: ModelStatus.ACTIVE,
    })
    @Index()
    status: ModelStatus;

    // Monitoring metrics
    @Column({ name: 'total_requests', type: 'bigint', default: 0 })
    totalRequests: number;

    @Column({ name: 'total_tokens_used', type: 'bigint', default: 0 })
    totalTokensUsed: number;

    @Column({ name: 'total_cost', type: 'decimal', precision: 12, scale: 2, default: 0 })
    totalCost: number;

    @Column({ name: 'avg_latency_ms', type: 'decimal', precision: 10, scale: 2, nullable: true })
    avgLatencyMs: number;

    @Column({ name: 'success_rate', type: 'decimal', precision: 5, scale: 4, nullable: true })
    successRate: number;
    interactions: any;
}
