import { Entity, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Content } from './content.entity';
import { TargetAudience, PromotionType } from '../../../common/constants/content.constant';

@Entity('promotion_contents')
export class PromotionContent extends BaseEntity {
    @Column({ name: 'content_id' })
    contentId: string;

    @Column({
        type: 'enum',
        enum: PromotionType,
    })
    promotionType: PromotionType;

    @Column({ nullable: true })
    code: string;

    @Column({ name: 'discount_type' })
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';

    @Column({ name: 'discount_value', type: 'decimal', precision: 10, scale: 2 })
    discountValue: number;

    @Column({ name: 'max_discount', type: 'decimal', precision: 10, scale: 2, nullable: true })
    maxDiscount: number;

    @Column({ name: 'min_order_value', type: 'decimal', precision: 10, scale: 2, nullable: true })
    minOrderValue: number;

    @Column({ name: 'applicable_venues', type: 'simple-array', nullable: true })
    applicableVenues: string[];

    @Column({ name: 'applicable_sports', type: 'simple-array', nullable: true })
    applicableSports: string[];

    @Column({ name: 'applicable_days', type: 'simple-array', nullable: true })
    applicableDays: number[];

    @Column({ name: 'applicable_hours', type: 'jsonb', nullable: true })
    applicableHours: any[];

    @Column({ name: 'max_uses', nullable: true })
    maxUses: number;

    @Column({ name: 'max_uses_per_user', nullable: true })
    maxUsesPerUser: number;

    @Column({ name: 'current_uses', default: 0 })
    currentUses: number;

    @Column({ name: 'start_date', type: 'timestamp' })
    startDate: Date;

    @Column({ name: 'end_date', type: 'timestamp' })
    endDate: Date;

    @Column({
        name: 'target_audience',
        type: 'enum',
        enum: TargetAudience,
    })
    targetAudience: TargetAudience;

    @Column({ name: 'min_membership_level', nullable: true })
    minMembershipLevel: string;

    @Column({ name: 'total_revenue', type: 'decimal', precision: 15, scale: 2, default: 0 })
    totalRevenue: number;

    @Column({ name: 'total_bookings', default: 0 })
    totalBookings: number;

    @Column({ name: 'conversion_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
    conversionRate: number;

    @OneToOne(() => Content)
    @JoinColumn({ name: 'content_id' })
    content: Content;
}
