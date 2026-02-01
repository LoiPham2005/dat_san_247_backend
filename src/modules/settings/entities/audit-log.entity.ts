import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('audit_logs')
export class AuditLog extends BaseEntity {
    @Column({ name: 'user_id', type: 'uuid', nullable: true })
    @Index()
    userId: string;

    @Column()
    action: string; // e.g., "VENUE_APPROVED", "USER_BANNED", "WALLET_EDITED"

    @Column({ name: 'target_type', nullable: true })
    targetType: string; // e.g., "VENUE", "USER", "WALLET"

    @Column({ name: 'target_id', type: 'uuid', nullable: true })
    targetId: string;

    @Column({ type: 'jsonb', nullable: true })
    oldValues: any;

    @Column({ type: 'jsonb', nullable: true })
    newValues: any;

    @Column({ name: 'ip_address', nullable: true })
    ipAddress: string;

    @Column({ name: 'user_agent', type: 'text', nullable: true })
    userAgent: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;
}
