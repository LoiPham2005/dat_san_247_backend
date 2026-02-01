import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('user_devices')
export class UserDevice extends BaseEntity {
    @Column({ name: 'user_id', type: 'uuid' })
    @Index()
    userId: string;

    @Column({ name: 'fcm_token', type: 'text' })
    fcmToken: string;

    @Column({ name: 'device_type', nullable: true, comment: 'ios, android, web' })
    deviceType: string;

    @Column({ name: 'device_model', nullable: true })
    deviceModel: string;

    @Column({ name: 'os_version', nullable: true })
    osVersion: string;

    @Column({ name: 'app_version', nullable: true })
    appVersion: string;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @Column({ name: 'last_active_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    lastActiveAt: Date;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
}
