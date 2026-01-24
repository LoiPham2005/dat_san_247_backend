import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { ConversationType, ConversationStatus } from '../../../common/constants/chat.constant';
import { Message } from './message.entity';
import { ConversationParticipant } from './participant.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { Venue } from '../../venues/entities/venue.entity';

@Entity('conversations')
export class Conversation extends BaseEntity {
    @Column({
        type: 'enum',
        enum: ConversationType,
    })
    @Index()
    type: ConversationType;

    @Column({
        type: 'enum',
        enum: ConversationStatus,
        default: ConversationStatus.ACTIVE,
    })
    @Index()
    status: ConversationStatus;

    @Column({ name: 'booking_id', nullable: true })
    bookingId: string;

    @Column({ name: 'venue_id', nullable: true })
    venueId: string;

    @Column({ nullable: true })
    title: string;

    @Column({ nullable: true })
    avatar: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ name: 'last_message_id', nullable: true })
    lastMessageId: string;

    @Column({ name: 'last_message_at', type: 'timestamp', nullable: true })
    lastMessageAt: Date;

    @Column({ name: 'last_message_preview', nullable: true })
    lastMessagePreview: string;

    @Column({ name: 'participant_count', default: 0 })
    participantCount: number;

    @Column({ name: 'is_encrypted', default: false })
    isEncrypted: boolean;

    @Column({ name: 'auto_close_after', nullable: true })
    autoCloseAfter: number; // Minutes

    @Column({ name: 'closed_at', type: 'timestamp', nullable: true })
    closedAt: Date;

    @Column({ name: 'closed_by', nullable: true })
    closedBy: string;

    @Column({ name: 'created_by' })
    createdBy: string;

    @ManyToOne(() => Booking, { nullable: true })
    @JoinColumn({ name: 'booking_id' })
    booking: Booking;

    @ManyToOne(() => Venue, { nullable: true })
    @JoinColumn({ name: 'venue_id' })
    venue: Venue;

    @OneToMany(() => ConversationParticipant, (participant) => participant.conversation)
    participants: ConversationParticipant[];

    @OneToMany(() => Message, (message) => message.conversation)
    messages: Message[];

    @ManyToOne(() => Message, { nullable: true })
    @JoinColumn({ name: 'last_message_id' })
    lastMessage: Message;
}
