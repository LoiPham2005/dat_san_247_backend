import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { ChatType } from '../../../common/constants/chat.constant';
import { User } from '../../users/entities/user.entity';
import { Venue } from '../../venues/entities/venue.entity';
import { ConversationParticipant } from './participant.entity';
import { Message } from './message.entity';

@Entity('chat_conversations')
export class Conversation extends BaseEntity {
    @Column({
        type: 'enum',
        enum: ChatType,
    })
    @Index()
    type: ChatType;

    @Column({ nullable: true, length: 255 })
    name: string;

    @Column({ name: 'avatar_url', type: 'text', nullable: true })
    avatarUrl: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    // Venue context
    @Column({ name: 'venue_id', type: 'uuid', nullable: true })
    venueId: string;

    @ManyToOne(() => Venue, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'venue_id' })
    venue: Venue;

    // Team context
    @Column({ name: 'is_team', default: false })
    isTeam: boolean;

    @Column({ name: 'team_sport_type', nullable: true })
    teamSportType: string;

    @Column({ name: 'max_members', default: 50 })
    maxMembers: number;

    // Settings
    @Column({ name: 'is_muted', default: false })
    isMuted: boolean;

    @Column({ name: 'is_archived', default: false })
    isArchived: boolean;

    @Column({ name: 'allow_members_invite', default: true })
    allowMembersInvite: boolean;

    // Metadata
    @Column({ name: 'last_message_id', type: 'uuid', nullable: true })
    lastMessageId: string;

    @Column({ name: 'last_message_at', type: 'timestamp', nullable: true })
    lastMessageAt: Date;

    @Column({ name: 'total_messages', default: 0 })
    totalMessages: number;

    @Column({ name: 'total_members', default: 0 })
    totalMembers: number;

    @Column({ name: 'created_by', type: 'uuid', nullable: true })
    createdById: string;

    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'created_by' })
    createdBy: User;

    @OneToMany(() => ConversationParticipant, (participant) => participant.conversation)
    participants: ConversationParticipant[];

    @OneToMany(() => Message, (message) => message.conversation)
    messages: Message[];
}
