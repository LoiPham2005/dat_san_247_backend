import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { MessageSender } from '../../../common/constants/ai.constant';
import { AIConversation } from './ai-conversation.entity';

@Entity('ai_messages')
export class AIMessage extends BaseEntity {
    @Column({ name: 'conversation_id' })
    @Index()
    conversationId: string;

    @Column({
        type: 'enum',
        enum: MessageSender,
    })
    sender: MessageSender;

    @Column({ name: 'sender_id', nullable: true })
    senderId: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ type: 'float', nullable: true })
    confidence: number;

    @Column({ nullable: true })
    intent: string;

    @Column({ type: 'jsonb', nullable: true })
    entities: Record<string, any>;

    @Column({ type: 'simple-array', nullable: true })
    suggestions: string[];

    @Column({ type: 'jsonb', nullable: true })
    actions: any[];

    @Column({ name: 'model_used', nullable: true })
    modelUsed: string;

    @Column({ name: 'tokens_used', nullable: true })
    tokensUsed: number;

    @Column({ name: 'response_time', nullable: true })
    responseTime: number;

    @Column({ name: 'is_helpful', nullable: true })
    isHelpful: boolean;

    @Column({ name: 'user_feedback', type: 'text', nullable: true })
    userFeedback: string;

    @ManyToOne(() => AIConversation, (conversation) => conversation.messages, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'conversation_id' })
    conversation: AIConversation;
}
