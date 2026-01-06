import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { ActivityType } from '../../../common/constants/activity-type.constant';

@Entity('activity_logs')
export class ActivityLog extends BaseEntity {
    @Column({ name: 'user_id', nullable: true })
    userId: string;

    @Column({
        name: 'activity_type',
        type: 'enum',
        enum: ActivityType,
    })
    activityType: ActivityType;

    @Column({ name: 'entity_type', nullable: true })
    entityType: string;

    @Column({ name: 'entity_id', type: 'uuid', nullable: true })
    entityId: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ name: 'ip_address', type: 'inet', nullable: true })
    ipAddress: string;

    @Column({ name: 'user_agent', type: 'text', nullable: true })
    userAgent: string;

    @Column({ type: 'jsonb', nullable: true })
    metadata: any;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;
}
