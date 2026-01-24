import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { MessageType, MessageStatus } from '../../../common/constants/chat.constant';
import { Conversation } from './conversation.entity';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../../common/constants/role.constant';

@Entity('messages')
export class Message extends BaseEntity {
    @Column({ name: 'conversation_id' })
    @Index()
    conversationId: string;

    @Column({ name: 'sender_id' })
    @Index()
    senderId: string;

    @Column({
        name: 'sender_role',
        type: 'enum',
        enum: UserRole,
    })
    senderRole: UserRole;

    @Column({
        type: 'enum',
        enum: MessageType,
        default: MessageType.TEXT,
    })
    type: MessageType;

    @Column({ type: 'text', nullable: true })
    content: string;

    @Column({ name: 'media_urls', type: 'simple-array', nullable: true })
    mediaUrls: string[];

    @Column({ name: 'thumbnail_urls', type: 'simple-array', nullable: true })
    thumbnailUrls: string[];

    @Column({ name: 'voice_url', nullable: true })
    voiceUrl: string;

    @Column({ name: 'voice_duration', nullable: true })
    voiceDuration: number;

    @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
    latitude: number;

    @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
    longitude: number;

    @Column({ name: 'location_name', nullable: true })
    locationName: string;

    @Column({ name: 'reply_to_message_id', nullable: true })
    replyToMessageId: string;

    @Column({ name: 'forwarded_from_message_id', nullable: true })
    forwardedFromMessageId: string;

    @Column({ name: 'booking_id', nullable: true })
    bookingId: string;

    @Column({ name: 'venue_id', nullable: true })
    venueId: string;

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>;

    @Column({
        type: 'enum',
        enum: MessageStatus,
        default: MessageStatus.SENT,
    })
    status: MessageStatus;

    @Column({ name: 'is_edited', default: false })
    isEdited: boolean;

    @Column({ name: 'edited_at', type: 'timestamp', nullable: true })
    editedAt: Date;

    @Column({ name: 'is_deleted', default: false })
    isDeleted: boolean;

    @Column({ name: 'deleted_by', nullable: true })
    deletedBy: string;

    @ManyToOne(() => Conversation, (conversation) => conversation.messages, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'conversation_id' })
    conversation: Conversation;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'sender_id' })
    sender: User;

    @ManyToOne(() => Message, { nullable: true })
    @JoinColumn({ name: 'reply_to_message_id' })
    replyToMessage: Message;
}
