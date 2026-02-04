import { Entity, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum QuotaPeriod {
    HOURLY = 'HOURLY',
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
}

@Entity('ai_quotas')
@Unique(['userId', 'featureCode', 'period'])
export class AIQuota extends BaseEntity {
    @Column({ name: 'user_id', type: 'uuid', nullable: true })
    @Index()
    userId: string;

    @Column({ name: 'feature_code', nullable: true, comment: 'AI feature this quota applies to' })
    @Index()
    featureCode: string;

    @Column({
        type: 'enum',
        enum: QuotaPeriod,
    })
    period: QuotaPeriod;

    // Quota limits
    @Column({ name: 'max_requests', nullable: true })
    maxRequests: number;

    @Column({ name: 'max_tokens', type: 'bigint', nullable: true })
    maxTokens: number;

    @Column({ name: 'max_cost', type: 'decimal', precision: 10, scale: 2, nullable: true })
    maxCost: number;

    // Current usage (reset based on period)
    @Column({ name: 'current_requests', default: 0 })
    currentRequests: number;

    @Column({ name: 'current_tokens', type: 'bigint', default: 0 })
    currentTokens: number;

    @Column({ name: 'current_cost', type: 'decimal', precision: 10, scale: 2, default: 0 })
    currentCost: number;

    // Period tracking
    @Column({ name: 'period_start', type: 'timestamp' })
    periodStart: Date;

    @Column({ name: 'period_end', type: 'timestamp' })
    periodEnd: Date;

    // Auto-reset
    @Column({ name: 'auto_reset', default: true })
    autoReset: boolean;

    // Notifications
    @Column({ name: 'notify_at_percentage', nullable: true, comment: 'Send alert when usage reaches this %' })
    notifyAtPercentage: number;

    @Column({ name: 'last_notified_at', type: 'timestamp', nullable: true })
    lastNotifiedAt: Date;

    @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
}
