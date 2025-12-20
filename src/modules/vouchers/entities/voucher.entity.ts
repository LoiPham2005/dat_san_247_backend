// =====================================================
// 10. VOUCHER ENTITY
// =====================================================
// modules/vouchers/entities/voucher.entity.ts
import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { VoucherUsage } from './voucher-usage.entity';

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
}

export enum ApplicableTo {
  ALL = 'all',
  SPECIFIC_VENUES = 'specific_venues',
  SPECIFIC_SPORTS = 'specific_sports',
  FIRST_BOOKING = 'first_booking',
}

@Entity('vouchers')
@Index(['voucherCode'])
@Index(['isActive', 'validFrom', 'validTo'])
export class Voucher extends BaseEntity {
  @Column({ name: 'voucher_code', unique: true, length: 50 })
  voucherCode: string;

  @Column({ name: 'voucher_name', length: 200 })
  voucherName: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'discount_type', type: 'enum', enum: DiscountType })
  discountType: DiscountType;

  @Column({ name: 'discount_value', type: 'decimal', precision: 15, scale: 2 })
  discountValue: number;

  @Column({ name: 'max_discount_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  maxDiscountAmount?: number;

  @Column({ name: 'min_order_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  minOrderAmount: number;

  @Column({ name: 'usage_limit', nullable: true })
  usageLimit?: number;

  @Column({ name: 'used_count', default: 0 })
  usedCount: number;

  @Column({ name: 'usage_per_user', default: 1 })
  usagePerUser: number;

  @Column({ name: 'applicable_to', type: 'enum', enum: ApplicableTo })
  applicableTo: ApplicableTo;

  @Column({ name: 'venue_ids', type: 'json', nullable: true })
  venueIds?: string[];

  @Column({ name: 'sport_type_ids', type: 'json', nullable: true })
  sportTypeIds?: string[];

  @Column({ name: 'valid_from', type: 'timestamp' })
  validFrom: Date;

  @Column({ name: 'valid_to', type: 'timestamp' })
  validTo: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator?: User;

  @OneToMany(() => VoucherUsage, (usage) => usage.voucher)
  usages: VoucherUsage[];
}