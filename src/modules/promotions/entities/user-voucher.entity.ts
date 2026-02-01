import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Promotion } from '../../promotions/entities/promotion.entity';

export enum VoucherStatus {
    UNUSED = 'UNUSED',
    USED = 'USED',
    EXPIRED = 'EXPIRED'
}

@Entity('user_vouchers')
export class UserVoucher extends BaseEntity {
    @Column({ name: 'user_id', type: 'uuid' })
    @Index()
    userId: string;

    @Column({ name: 'promotion_id', type: 'uuid' })
    @Index()
    promotionId: string;

    @Column({
        type: 'enum',
        enum: VoucherStatus,
        default: VoucherStatus.UNUSED,
    })
    @Index()
    status: VoucherStatus;

    @Column({ name: 'collected_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    collectedAt: Date;

    @Column({ name: 'used_at', type: 'timestamp', nullable: true })
    usedAt: Date;

    @Column({ name: 'order_id', nullable: true, comment: 'Booking/Payment ID where voucher was used' })
    orderId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Promotion, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'promotion_id' })
    promotion: Promotion;
}
