import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { AIMessage } from './ai-message.entity';

@Entity('ai_feedback')
export class AIFeedback extends BaseEntity {
    @Column({ name: 'message_id' })
    messageId: string;

    @Column({ name: 'user_id' })
    userId: string;

    @Column({ type: 'int' })
    rating: number; // 1-5

    @Column({ name: 'is_helpful', nullable: true })
    isHelpful: boolean;

    @Column({ name: 'feedback_text', type: 'text', nullable: true })
    feedbackText: string;

    @ManyToOne(() => AIMessage, message => message.feedbacks, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'message_id' })
    message: AIMessage;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
}
