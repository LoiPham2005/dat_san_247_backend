import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Promotion } from './promotion.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { User } from '../../users/entities/user.entity';

@Entity('promotion_usage')
export class PromotionUsage extends BaseEntity {
    @Column({ name: 'promotion_id' })
    promotionId: string;

    @Column({ name: 'booking_id' })
    bookingId: string;

    @Column({ name: 'user_id' })
    userId: string;

    @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2 })
    discountAmount: number;

    @ManyToOne(() => Promotion, (promotion) => promotion.usages, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'promotion_id' })
    promotion: Promotion;

    @ManyToOne(() => Booking)
    @JoinColumn({ name: 'booking_id' })
    booking: Booking;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;
}
