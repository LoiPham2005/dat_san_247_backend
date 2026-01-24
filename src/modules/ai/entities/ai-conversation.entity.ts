import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { AIConversationStatus } from '../../../common/constants/ai.constant';
import { User } from '../../users/entities/user.entity';
import { AIBot } from './ai-bot.entity';
import { AIMessage } from './ai-message.entity';
import { Booking } from '../../bookings/entities/booking.entity';

@Entity('ai_conversations')
export class AIConversation extends BaseEntity {
    @Column({ name: 'bot_id' })
    @Index()
    botId: string;

    @Column({ name: 'user_id' })
    @Index()
    userId: string;

    @Column({
        type: 'enum',
        enum: AIConversationStatus,
        default: AIConversationStatus.ACTIVE,
    })
    status: AIConversationStatus;

    @Column({ name: 'handoff_reason', type: 'text', nullable: true })
    handoffReason: string;

    @Column({ name: 'handoff_to_user_id', nullable: true })
    handoffToUserId: string;

    @Column({ name: 'handoff_at', type: 'timestamp', nullable: true })
    handoffAt: Date;

    @Column({ name: 'user_intent', nullable: true })
    userIntent: string;

    @Column({ name: 'extracted_entities', type: 'jsonb', nullable: true })
    extractedEntities: Record<string, any>;

    @Column({ name: 'conversation_summary', type: 'text', nullable: true })
    conversationSummary: string;

    @Column({ name: 'user_rating', nullable: true })
    userRating: number;

    @Column({ name: 'user_feedback', type: 'text', nullable: true })
    userFeedback: string;

    @Column({ name: 'was_helpful', default: false })
    wasHelpful: boolean;

    @Column({ name: 'message_count', default: 0 })
    messageCount: number;

    @Column({ name: 'average_response_time', default: 0 })
    averageResponseTime: number;

    @Column({ name: 'average_confidence', type: 'float', default: 0 })
    averageConfidence: number;

    @Column({ name: 'lead_to_booking', default: false })
    leadToBooking: boolean;

    @Column({ name: 'booking_id', nullable: true })
    bookingId: string;

    @Column({ name: 'started_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    startedAt: Date;

    @Column({ name: 'ended_at', type: 'timestamp', nullable: true })
    endedAt: Date;

    @Column({ nullable: true })
    duration: number; // Seconds

    @ManyToOne(() => AIBot, (bot) => bot.conversations)
    @JoinColumn({ name: 'bot_id' })
    bot: AIBot;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToMany(() => AIMessage, (message) => message.conversation)
    messages: AIMessage[];

    @ManyToOne(() => Booking, { nullable: true })
    @JoinColumn({ name: 'booking_id' })
    booking: Booking;
}
