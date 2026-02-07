import { Entity, Column, ManyToOne, JoinColumn, OneToOne, Relation } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Content } from './content.entity';
import { TargetAudience, PromotionType } from '../../../common/constants/content.constant';
import { Promotion } from '../../promotions/entities/promotion.entity';

@Entity('promotion_contents')
export class PromotionContent extends BaseEntity {
    @Column({ name: 'content_id' })
    contentId: string;

    @Column({
        name: 'promotion_type',
        type: 'varchar',
        length: 50,
    })
    promotionType: PromotionType;

    @Column({ name: 'promotion_id', nullable: true })
    promotionId: string;

    @ManyToOne(() => Promotion)
    @JoinColumn({ name: 'promotion_id' })
    promotion: Relation<Promotion>;

    @Column({ name: 'min_membership_level', nullable: true })
    minMembershipLevel: string;

    @Column({ name: 'total_revenue', type: 'decimal', precision: 15, scale: 2, default: 0 })
    totalRevenue: number;

    @Column({ name: 'total_bookings', default: 0 })
    totalBookings: number;

    @Column({ name: 'conversion_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
    conversionRate: number;

    @ApiProperty({ type: () => Content })
    @OneToOne(() => Content, (content) => content.promotion)
    @JoinColumn({ name: 'content_id' })
    content: Relation<Content>;
}
