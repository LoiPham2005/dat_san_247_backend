import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { NotificationType } from '../../../common/constants/notification-type.constant';
import { NotificationChannel } from '../../../common/constants/notification-channel.constant';

@Entity('notifications')
export class Notification extends BaseEntity {
    @Column({ name: 'user_id' })
    @Index()
    userId: string;

    @Column({
        type: 'enum',
        enum: NotificationType,
    })
    type: NotificationType;

    @Column({
        type: 'enum',
        enum: NotificationChannel,
    })
    channel: NotificationChannel;

    @Column()
    title: string;

    @Column({ type: 'text' })
    message: string;

    @Column({ type: 'jsonb', nullable: true })
    data: any;

    @Column({ name: 'is_read', default: false })
    @Index()
    isRead: boolean;

    @Column({ name: 'read_at', type: 'timestamp', nullable: true })
    readAt: Date;

    @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
}
