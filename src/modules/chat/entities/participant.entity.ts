import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { ParticipantRole } from '../../../common/constants/chat.constant';
import { Conversation } from './conversation.entity';
import { User } from '../../users/entities/user.entity';

@Entity('conversation_participants')
@Index(['conversationId', 'userId'], { unique: true })
export class ConversationParticipant extends BaseEntity {
    @Column({ name: 'conversation_id' })
    conversationId: string;

    @Column({ name: 'user_id' })
    userId: string;

    @Column({
        type: 'enum',
        enum: ParticipantRole,
        default: ParticipantRole.MEMBER,
    })
    role: ParticipantRole;

    @Column({ name: 'last_read_message_id', nullable: true })
    lastReadMessageId: string;

    @Column({ name: 'last_read_at', type: 'timestamp', nullable: true })
    lastReadAt: Date;

    @Column({ name: 'unread_count', default: 0 })
    unreadCount: number;

    @Column({ name: 'is_muted', default: false })
    isMuted: boolean;

    @Column({ name: 'muted_until', type: 'timestamp', nullable: true })
    mutedUntil: Date;

    @Column({ name: 'is_pinned', default: false })
    isPinned: boolean;

    @Column({ name: 'custom_name', nullable: true })
    customName: string;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @Column({ name: 'left_at', type: 'timestamp', nullable: true })
    leftAt: Date;

    @Column({ name: 'invited_by', nullable: true })
    invitedBy: string;

    @ManyToOne(() => Conversation, (conversation) => conversation.participants, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'conversation_id' })
    conversation: Conversation;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;
}
