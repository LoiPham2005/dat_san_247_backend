import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Relation } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { AISearchRanking } from './ai-search-ranking.entity';

@Entity('ai_search_queries')
export class AISearchQuery extends BaseEntity {
    @Column({ name: 'user_id', nullable: true })
    userId: string;

    @Column({ name: 'session_id', nullable: true })
    sessionId: string;

    @Column({ name: 'original_query', type: 'text' })
    originalQuery: string;

    @Column({ name: 'normalized_query', type: 'text', nullable: true })
    normalizedQuery: string;

    @Column({ name: 'detected_intent', nullable: true })
    detectedIntent: string;

    @Column({ name: 'extracted_entities', type: 'jsonb', nullable: true })
    extractedEntities: Record<string, any>;

    @Column({ name: 'query_category', nullable: true })
    queryCategory: string;

    @Column({ name: 'results_count', type: 'int', nullable: true })
    resultsCount: number;

    @Column({ name: 'results_shown', type: 'jsonb', nullable: true })
    resultsShown: any[];

    @Column({ name: 'clicked_results', type: 'jsonb', nullable: true })
    clickedResults: any[];

    @Column({ name: 'query_expansion', type: 'jsonb', nullable: true })
    queryExpansion: any[];

    @Column({ name: 'spelling_correction', type: 'text', nullable: true })
    spellingCorrection: string;

    @Column({ name: 'suggested_queries', type: 'jsonb', nullable: true })
    suggestedQueries: any[];

    @Column({ name: 'search_duration_ms', type: 'int', nullable: true })
    searchDurationMs: number;

    @Column({ name: 'ai_processing_time_ms', type: 'int', nullable: true })
    aiProcessingTimeMs: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'user_id' })
    user: Relation<User>;

    @OneToMany(() => AISearchRanking, (ranking) => ranking.query)
    rankings: Relation<AISearchRanking>[];
}
