import { Entity, Column, JoinColumn, OneToOne, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('chat_settings')
export class ChatSettings extends BaseEntity {
    @Column({ name: 'user_id', type: 'uuid', unique: true })
    @Index()
    userId: string;

    @Column({ name: 'is_online', default: false })
    isOnline: boolean;

    @Column({ name: 'last_seen_at', type: 'timestamp', nullable: true })
    lastSeenAt: Date;

    @Column({
        name: 'last_seen_privacy',
        type: 'varchar',
        default: 'EVERYONE',
    })
    lastSeenPrivacy: 'EVERYONE' | 'CONTACTS' | 'NOBODY';

    @Column({ name: 'allow_notifications', default: true })
    allowNotifications: boolean;

    @Column({ name: 'message_sound', default: true })
    messageSound: boolean;

    @Column({ name: 'vibration', default: true })
    vibration: boolean;

    @Column({ name: 'read_receipts', default: true })
    readReceipts: boolean;

    @Column({ name: 'typing_indicator', default: true })
    typingIndicator: boolean;

    // Professional Auto-reply for Venues/Support
    @Column({ name: 'auto_reply_enabled', default: false })
    autoReplyEnabled: boolean;

    @Column({ name: 'auto_reply_message', type: 'text', nullable: true })
    autoReplyMessage: string;

    @Column({ name: 'auto_reply_schedule', type: 'jsonb', nullable: true })
    autoReplySchedule: any;

    @OneToOne(() => User, (user) => user.chatSettings, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
}
