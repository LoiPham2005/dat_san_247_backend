import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { AIConversationStatus, SentimentType } from '../../../common/constants/ai.constant';
import { User } from '../../users/entities/user.entity';
import { AIMessage } from './ai-message.entity';

@Entity('ai_conversations')
export class AIConversation extends BaseEntity {
    @Column({ name: 'user_id', nullable: true })
    @Index()
    userId: string;

    @Column({ name: 'session_id' })
    sessionId: string;

    @Column({
        type: 'enum',
        enum: AIConversationStatus,
        default: AIConversationStatus.ACTIVE,
    })
    status: AIConversationStatus;

    @Column({ nullable: true })
    topic: string;

    @Column({
        type: 'enum',
        enum: SentimentType,
        default: SentimentType.NEUTRAL,
    })
    sentiment: SentimentType;

    @Column({ name: 'is_resolved', default: false })
    isResolved: boolean;

    @Column({ name: 'escalated_to_agent_id', nullable: true })
    escalatedToAgentId: string;

    @Column({ name: 'escalated_at', type: 'timestamp', nullable: true })
    escalatedAt: Date;

    @Column({ name: 'resolved_at', type: 'timestamp', nullable: true })
    resolvedAt: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'escalated_to_agent_id' })
    escalatedToAgent: User;

    @OneToMany(() => AIMessage, (message) => message.conversation)
    messages: AIMessage[];
}
