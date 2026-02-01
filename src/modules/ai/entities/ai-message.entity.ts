import { Entity, Column, ManyToOne, JoinColumn, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { MessageSenderType } from '../../../common/constants/ai.constant';
import { AIConversation } from './ai-conversation.entity';
import { User } from '../../users/entities/user.entity';
import { AIFeedback } from './ai-feedback.entity';

@Entity('ai_messages')
export class AIMessage extends BaseEntity {
    @Column({ name: 'conversation_id' })
    @Index()
    conversationId: string;

    @Column({
        name: 'sender_type',
        type: 'enum',
        enum: MessageSenderType,
    })
    senderType: MessageSenderType;

    @Column({ name: 'sender_id', nullable: true })
    senderId: string;

    @Column({ type: 'text' })
    message: string;

    @Column({ nullable: true })
    intent: string;

    @Column({ type: 'jsonb', nullable: true })
    entities: Record<string, any>;

    @Column({ name: 'confidence_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
    confidenceScore: number;

    @Column({ name: 'ai_model', nullable: true })
    aiModel: string;

    @Column({ name: 'tokens_used', nullable: true })
    tokensUsed: number;

    @ManyToOne(() => AIConversation, (conversation) => conversation.messages, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'conversation_id' })
    conversation: AIConversation;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'sender_id' })
    sender: User;

    @OneToMany(() => AIFeedback, feedback => feedback.message)
    feedbacks: AIFeedback[];
}
