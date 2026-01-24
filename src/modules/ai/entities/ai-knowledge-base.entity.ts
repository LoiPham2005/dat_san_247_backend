import { Entity, Column, ManyToMany, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { KnowledgeType } from '../../../common/constants/ai.constant';
import { UserRole } from '../../../common/constants/role.constant';
import { AIBot } from './ai-bot.entity';

@Entity('ai_knowledge_bases')
export class AIKnowledgeBase extends BaseEntity {
    @Column({
        type: 'enum',
        enum: KnowledgeType,
    })
    @Index()
    type: KnowledgeType;

    @Column()
    title: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ type: 'jsonb', nullable: true, select: false })
    embedding: number[];

    @Column({ name: 'embedding_model', nullable: true })
    embeddingModel: string;

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>;

    @Column({ type: 'simple-array', nullable: true })
    tags: string[];

    @Column({ nullable: true })
    category: string;

    @Column({ name: 'source_type', default: 'MANUAL' })
    sourceType: 'MANUAL' | 'SCRAPE' | 'UPLOAD' | 'API';

    @Column({ name: 'source_url', nullable: true })
    sourceUrl: string;

    @Column({ name: 'source_file_url', nullable: true })
    sourceFileUrl: string;

    @Column({ name: 'parent_id', nullable: true })
    parentId: string;

    @Column({ name: 'chunk_index', nullable: true })
    chunkIndex: number;

    @Column({ name: 'total_chunks', nullable: true })
    totalChunks: number;

    @Column({ name: 'times_retrieved', default: 0 })
    timesRetrieved: number;

    @Column({ name: 'last_retrieved_at', type: 'timestamp', nullable: true })
    lastRetrievedAt: Date;

    @Column({ type: 'float', nullable: true })
    accuracy: number;

    @Column({ name: 'needs_update', default: false })
    needsUpdate: boolean;

    @Column({ name: 'is_public', default: true })
    isPublic: boolean;

    @Column({ name: 'visible_to', type: 'simple-array', nullable: true })
    visibleTo: UserRole[];

    @Column({ name: 'created_by' })
    createdBy: string;

    @ManyToMany(() => AIBot, (bot) => bot.knowledgeBases)
    bots: AIBot[];
}
