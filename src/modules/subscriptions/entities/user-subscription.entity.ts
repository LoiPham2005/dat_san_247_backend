import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { SubscriptionPlan } from './subscription-plan.entity';

export enum SubscriptionStatus {
    ACTIVE = 'ACTIVE',
    EXPIRED = 'EXPIRED',
    CANCELLED = 'CANCELLED',
    PENDING = 'PENDING'
}

@Entity('user_subscriptions')
export class UserSubscription extends BaseEntity {
    @Column({ name: 'user_id', type: 'uuid' })
    @Index()
    userId: string;

    @Column({ name: 'plan_id', type: 'uuid' })
    @Index()
    planId: string;

    @Column({ name: 'start_date', type: 'timestamp' })
    startDate: Date;

    @Column({ name: 'end_date', type: 'timestamp' })
    @Index()
    endDate: Date;

    @Column({
        type: 'enum',
        enum: SubscriptionStatus,
        default: SubscriptionStatus.ACTIVE,
    })
    @Index()
    status: SubscriptionStatus;

    @Column({ name: 'auto_renew', default: true })
    autoRenew: boolean;

    @Column({ name: 'payment_method_id', nullable: true })
    paymentMethodId: string;

    @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => SubscriptionPlan, { eager: true })
    @JoinColumn({ name: 'plan_id' })
    plan: SubscriptionPlan;
}
