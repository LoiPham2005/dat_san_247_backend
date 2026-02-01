import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { RefundPolicy } from './refund-policy.entity';

@Entity('refund_rules')
export class RefundRule extends BaseEntity {
    @Column({ name: 'policy_id', type: 'uuid' })
    policyId: string;

    @Column({ name: 'cancel_before_hours', type: 'int', comment: 'Hours before booking to apply this refund' })
    cancelBeforeHours: number;

    @Column({ name: 'refund_percentage', type: 'decimal', precision: 5, scale: 2 })
    refundPercentage: number;

    @ManyToOne(() => RefundPolicy, (policy) => policy.rules, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'policy_id' })
    policy: RefundPolicy;
}
