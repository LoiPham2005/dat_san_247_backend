import { Entity, Column, ManyToOne, JoinColumn, Index, Unique, Relation } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('notification_settings')
@Unique(['userId'])
export class NotificationSetting extends BaseEntity {
    @Column({ name: 'user_id', type: 'uuid' })
    @Index()
    userId: string;

    @Column({ name: 'enable_push', default: true })
    enablePush!: boolean;

    @Column({ name: 'enable_email', default: true })
    enableEmail!: boolean;

    @Column({ name: 'enable_sms', default: false })
    enableSms!: boolean;

    @Column({ name: 'booking_reminders', default: true })
    bookingReminders!: boolean;

    @Column({ name: 'promotional_messages', default: true })
    promotionalMessages!: boolean;

    @Column({ name: 'social_activity', default: true })
    socialActivity!: boolean; // Likes, comments, etc.

    @Column({ name: 'community_alerts', default: true })
    communityAlerts!: boolean; // Match finding alerts

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: Relation<User>;
}
