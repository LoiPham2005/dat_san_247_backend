// =====================================================
// 6. PRICING_RULE ENTITY
// =====================================================
// modules/courts/entities/pricing-rule.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Court } from './court.entity';

export enum DayType {
  WEEKDAY = 'weekday',
  WEEKEND = 'weekend',
  HOLIDAY = 'holiday',
}

@Entity('pricing_rules')
@Index(['courtId', 'dayType'])
export class PricingRule extends BaseEntity {
  @Column({ name: 'court_id', type: 'uuid' })
  courtId: string;

  @Column({ name: 'day_type', type: 'enum', enum: DayType })
  dayType: DayType;

  @Column({ name: 'time_from', type: 'time' })
  timeFrom: string;

  @Column({ name: 'time_to', type: 'time' })
  timeTo: string;

  @Column({ name: 'price_per_hour', type: 'decimal', precision: 15, scale: 2 })
  pricePerHour: number;

  @Column({ name: 'min_booking_duration', default: 60 })
  minBookingDuration: number;

  @Column({ name: 'max_booking_duration', default: 180 })
  maxBookingDuration: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'valid_from', type: 'date', nullable: true })
  validFrom?: Date;

  @Column({ name: 'valid_to', type: 'date', nullable: true })
  validTo?: Date;

  @ManyToOne(() => Court, (court) => court.pricingRules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'court_id' })
  court: Court;
}
