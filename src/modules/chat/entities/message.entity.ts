import { Entity, Column, ManyToOne, JoinColumn, Index, OneToMany, Relation } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { MessageType } from '../../../common/constants/chat.constant';
import { Conversation } from './conversation.entity';
import { User } from '../../users/entities/user.entity';
import { MessageReceipt } from './message-receipt.entity';
import { MessageReaction } from './message-reaction.entity';

@Entity('chat_messages')
export class Message extends BaseEntity {
    @Column({ name: 'conversation_id', type: 'uuid' })
    @Index()
    conversationId: string;

    @Column({ name: 'sender_id', type: 'uuid' })
    senderId: string;

    // Message content
    @Column({
        type: 'enum',
        enum: MessageType,
        default: MessageType.TEXT,
    })
    type: MessageType;

    @Column({ type: 'text', nullable: true })
    content: string;

    // Rich content
    @Column({ name: 'media_urls', type: 'jsonb', nullable: true })
    mediaUrls: any;

    // Special message types
    @Column({ name: 'booking_id', type: 'uuid', nullable: true })
    bookingId: string;

    @Column({ name: 'venue_id', type: 'uuid', nullable: true })
    venueId: string;

    @Column({ type: 'jsonb', nullable: true })
    location: any;

    // Reply/Thread
    @Column({ name: 'reply_to_message_id', type: 'uuid', nullable: true })
    replyToMessageId: string;

    // Message metadata
    @Column({ name: 'is_edited', default: false })
    isEdited: boolean;

    @Column({ name: 'edited_at', type: 'timestamp', nullable: true })
    editedAt: Date;

    @Column({ name: 'is_deleted', default: false })
    isDeleted: boolean;

    @Column({ name: 'deleted_for_everyone', default: false })
    deletedForEveryone: boolean;


    @ManyToOne(() => Conversation, (conversation) => conversation.messages, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'conversation_id' })
    conversation: Relation<Conversation>;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'sender_id' })
    sender: Relation<User>;

    @ManyToOne(() => Message, { nullable: true })
    @JoinColumn({ name: 'reply_to_message_id' })
    replyToMessage: Relation<Message>;

    // Relations for receipts and reactions
    @OneToMany(() => MessageReceipt, receipt => receipt.message)
    receipts: MessageReceipt[];

    @OneToMany(() => MessageReaction, reaction => reaction.message)
    messageReactions: MessageReaction[];
}
