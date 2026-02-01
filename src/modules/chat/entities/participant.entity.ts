import { Entity, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { ChatMemberRole } from '../../../common/constants/chat.constant';
import { Conversation } from './conversation.entity';
import { User } from '../../users/entities/user.entity';

@Entity('chat_members')
@Unique(['conversationId', 'userId'])
export class ConversationParticipant extends BaseEntity {
    @Column({ name: 'conversation_id', type: 'uuid' })
    @Index()
    conversationId: string;

    @Column({ name: 'user_id', type: 'uuid' })
    @Index()
    userId: string;

    @Column({
        type: 'enum',
        enum: ChatMemberRole,
        default: ChatMemberRole.MEMBER,
    })
    role: ChatMemberRole;

    // Member settings
    @Column({ nullable: true, length: 100 })
    nickname: string;

    @Column({ name: 'is_muted', default: false })
    isMuted: boolean;

    @Column({ name: 'is_pinned', default: false })
    isPinned: boolean;

    // Read status
    @Column({ name: 'last_read_message_id', type: 'uuid', nullable: true })
    lastReadMessageId: string;

    @Column({ name: 'last_read_at', type: 'timestamp', nullable: true })
    lastReadAt: Date;

    @Column({ name: 'unread_count', default: 0 })
    unreadCount: number;

    // Notifications
    @Column({ name: 'notification_enabled', default: true })
    notificationEnabled: boolean;

    @Column({ name: 'joined_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    joinedAt: Date;

    @Column({ name: 'left_at', type: 'timestamp', nullable: true })
    leftAt: Date;

    @ManyToOne(() => Conversation, (conversation) => conversation.participants, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'conversation_id' })
    conversation: Conversation;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
}
