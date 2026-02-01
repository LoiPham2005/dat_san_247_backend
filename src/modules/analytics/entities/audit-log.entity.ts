import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('audit_logs')
export class AuditLog extends BaseEntity {
    @Column({ name: 'user_id', type: 'uuid', nullable: true })
    @Index()
    userId: string;

    @Column({ name: 'action', length: 100 })
    @Index()
    action: string; // e.g., 'BOOKING_CANCELLED', 'PRICE_CHANGED', 'REFUND_ISSUED'

    @Column({ name: 'entity_name', length: 50 })
    entityName: string; // e.g., 'Booking', 'Venue', 'Wallet'

    @Column({ name: 'entity_id', type: 'uuid', nullable: true })
    entityId: string;

    @Column({ type: 'jsonb', nullable: true, comment: 'Changes made: { old: ..., new: ... }' })
    changes: any;

    @Column({ name: 'ip_address', nullable: true })
    ipAddress: string;

    @Column({ name: 'user_agent', nullable: true })
    userAgent: string;

    @ManyToOne(() => User, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'user_id' })
    user: User;
}
