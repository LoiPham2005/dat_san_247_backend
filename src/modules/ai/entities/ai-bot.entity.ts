import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { BotType, BotStatus } from '../../../common/constants/ai.constant';
import { UserRole } from '../../../common/constants/role.constant';
import { AIConversation } from './ai-conversation.entity';
import { AIKnowledgeBase } from './ai-knowledge-base.entity';

@Entity('ai_bots')
export class AIBot extends BaseEntity {
    @Column()
    name: string;

    @Column({
        type: 'enum',
        enum: BotType,
    })
    type: BotType;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ nullable: true })
    avatar: string;

    @Column({ name: 'model_provider' })
    modelProvider: 'OPENAI' | 'ANTHROPIC' | 'GEMINI' | 'CUSTOM';

    @Column({ name: 'model_name' })
    modelName: string;

    @Column({ type: 'float', default: 0.7 })
    temperature: number;

    @Column({ name: 'max_tokens', default: 2048 })
    maxTokens: number;

    @Column({ name: 'system_prompt', type: 'text' })
    systemPrompt: string;

    @Column({ name: 'context_window', default: 10 })
    contextWindow: number;

    @Column({ name: 'can_handle_booking', default: false })
    canHandleBooking: boolean;

    @Column({ name: 'can_access_user_data', default: false })
    canAccessUserData: boolean;

    @Column({ name: 'can_make_recommendations', default: false })
    canMakeRecommendations: boolean;

    @Column({ name: 'can_process_payment', default: false })
    canProcessPayment: boolean;

    @Column({ name: 'auto_reply_enabled', default: true })
    autoReplyEnabled: boolean;

    @Column({ name: 'handoff_threshold', type: 'float', default: 0.5 })
    handoffToHumanThreshold: number;

    @Column({ name: 'greeting_message', type: 'text', nullable: true })
    greetingMessage: string;

    @Column({ name: 'fallback_message', type: 'text', nullable: true })
    fallbackMessage: string;

    @Column({
        type: 'enum',
        enum: BotStatus,
        default: BotStatus.ACTIVE,
    })
    status: BotStatus;

    @Column({ name: 'total_conversations', default: 0 })
    totalConversations: number;

    @Column({ name: 'total_messages', default: 0 })
    totalMessages: number;

    @Column({ name: 'average_confidence', type: 'float', default: 0 })
    averageConfidence: number;

    @Column({ name: 'success_rate', type: 'float', default: 0 })
    successRate: number;

    @Column({ name: 'last_trained_at', type: 'timestamp', nullable: true })
    lastTrainedAt: Date;

    @Column({ name: 'training_data_count', default: 0 })
    trainingDataCount: number;

    @Column({ name: 'available_for', type: 'simple-array' })
    availableFor: UserRole[];

    @Column({ name: 'created_by' })
    createdBy: string;

    @OneToMany(() => AIConversation, (conversation) => conversation.bot)
    conversations: AIConversation[];

    @ManyToMany(() => AIKnowledgeBase, (kb) => kb.bots)
    @JoinTable({
        name: 'ai_bot_knowledge_bases',
        joinColumn: { name: 'bot_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'knowledge_base_id', referencedColumnName: 'id' },
    })
    knowledgeBases: AIKnowledgeBase[];
}
