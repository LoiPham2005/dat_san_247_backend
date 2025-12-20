// =====================================================
// 11. VOUCHER_USAGE ENTITY
// =====================================================
// modules/vouchers/entities/voucher-usage.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Voucher } from './voucher.entity';
import { User } from '../../users/entities/user.entity';
import { Booking } from '../../bookings/entities/booking.entity';

@Entity('voucher_usage')
@Index(['voucherId'])
@Index(['userId'])
export class VoucherUsage extends BaseEntity {
  @Column({ name: 'voucher_id', type: 'uuid' })
  voucherId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'booking_id', type: 'uuid' })
  bookingId: string;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 15, scale: 2 })
  discountAmount: number;

  @Column({ name: 'used_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  usedAt: Date;

  @ManyToOne(() => Voucher, (voucher) => voucher.usages)
  @JoinColumn({ name: 'voucher_id' })
  voucher: Voucher;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Booking)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;
}