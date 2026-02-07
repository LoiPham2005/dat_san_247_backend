import { Entity, Column, ManyToOne, JoinColumn, Index, Unique, Relation } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { SystemAnnouncement } from './system-announcement.entity';

@Entity('system_announcement_reads')
@Unique(['userId', 'announcementId'])
export class SystemAnnouncementRead extends BaseEntity {
    @Column({ name: 'user_id', type: 'uuid' })
    @Index()
    userId: string;

    @Column({ name: 'announcement_id', type: 'uuid' })
    @Index()
    announcementId: string;

    @Column({ name: 'read_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    readAt: Date;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: Relation<User>;

    @ManyToOne(() => SystemAnnouncement, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'announcement_id' })
    announcement: Relation<SystemAnnouncement>;
}
