import {
    Entity,
    Column,
    OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { DiscountType } from '../../../common/constants/discount-type.constant';
import { PromotionStatus } from '../../../common/constants/promotion-status.constant';
import { PromotionVenue } from './promotion-venue.entity';
import { PromotionUsage } from './promotion-usage.entity';

@Entity('promotions')
export class Promotion extends BaseEntity {
    @Column({ unique: true })
    code: string;

    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({
        name: 'discount_type',
        type: 'enum',
        enum: DiscountType,
    })
    discountType: DiscountType;

    @Column({ name: 'discount_value', type: 'decimal', precision: 10, scale: 2 })
    discountValue: number;

    @Column({ name: 'max_discount_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
    maxDiscountAmount: number;

    @Column({ name: 'min_booking_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
    minBookingAmount: number;

    @Column({ name: 'usage_limit', nullable: true })
    usageLimit: number;

    @Column({ name: 'usage_count', default: 0 })
    usageCount: number;

    @Column({ name: 'valid_from', type: 'timestamp' })
    validFrom: Date;

    @Column({ name: 'valid_to', type: 'timestamp' })
    validTo: Date;

    @Column({
        type: 'enum',
        enum: PromotionStatus,
        default: PromotionStatus.ACTIVE,
    })
    status: PromotionStatus;

    @OneToMany(() => PromotionVenue, (pv) => pv.promotion)
    venues: PromotionVenue[];

    @OneToMany(() => PromotionUsage, (usage) => usage.promotion)
    usages: PromotionUsage[];
}
