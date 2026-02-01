import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { UserSubscription } from './user-subscription.entity';

@Entity('subscription_plans')
export class SubscriptionPlan extends BaseEntity {
    @Column({ unique: true })
    name: string; // e.g., 'PREMIUM_GOLD', 'PREMIUM_SILVER'

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'decimal', precision: 15, scale: 2 })
    monthlyPrice: number;

    @Column({ type: 'decimal', precision: 15, scale: 2 })
    yearlyPrice: number;

    @Column({ name: 'currency', default: 'VND' })
    currency: string;

    @Column({ name: 'features', type: 'jsonb', comment: 'List of features: { "priority_booking": true, "fee_discount": 0.05 }' })
    features: any;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @OneToMany(() => UserSubscription, (sub) => sub.plan)
    userSubscriptions: UserSubscription[];
}
