import { User } from 'src/modules/auth/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
}

export enum DiscountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
}

@Entity('discount_codes')
export class DiscountCode {
  @PrimaryGeneratedColumn({ name: 'code_id' })
  codeId: number;

  @Column({ length: 50, unique: true })
  code: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: DiscountType, name: 'discount_type' })
  discountType: DiscountType;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'discount_value' })
  discountValue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'min_order_amount' })
  minOrderAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'max_discount_amount' })
  maxDiscountAmount: number;

  @Column({ type: 'int', nullable: true, name: 'usage_limit' })
  usageLimit: number;

  @Column({ type: 'int', default: 1, name: 'usage_per_user' })
  usagePerUser: number;

  @Column({ type: 'int', default: 0, name: 'used_count' })
  usedCount: number;

  @Column({ type: 'timestamp', name: 'valid_from' })
  validFrom: Date;

  @Column({ type: 'timestamp', name: 'valid_until' })
  validUntil: Date;

  @Column({ type: 'json', nullable: true, name: 'applicable_venues' })
  applicableVenues: number[];

  @Column({ type: 'json', nullable: true, name: 'applicable_categories' })
  applicableCategories: number[];

  @Column({ type: 'json', nullable: true, name: 'applicable_days' })
  applicableDays: string[];

  @Column({ type: 'json', nullable: true, name: 'applicable_times' })
  applicableTimes: { start: string; end: string }[];

  @Column({ type: 'enum', enum: DiscountStatus, default: DiscountStatus.ACTIVE })
  status: DiscountStatus;

  @Column({ type: 'int', nullable: true, name: 'created_by' })
  createdBy: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
