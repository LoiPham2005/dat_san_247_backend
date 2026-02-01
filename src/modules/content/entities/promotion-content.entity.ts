import { Entity, Column, ManyToOne, JoinColumn, OneToOne, Relation } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Content } from './content.entity';
import { TargetAudience, PromotionType } from '../../../common/constants/content.constant';
import { Promotion } from '../../promotions/entities/promotion.entity';

@Entity('promotion_contents')
export class PromotionContent extends BaseEntity {
    @Column({ name: 'content_id' })
    contentId: string;

    @Column({
        type: 'enum',
        enum: PromotionType,
    })
    promotionType: PromotionType;

    @Column({ name: 'promotion_id', nullable: true })
    promotionId: string;

    @ManyToOne(() => Promotion)
    @JoinColumn({ name: 'promotion_id' })
    promotion: Relation<Promotion>;

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
