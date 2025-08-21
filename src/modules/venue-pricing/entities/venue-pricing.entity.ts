import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Venue } from '../../venues/entities/venue.entity';

export enum DayType {
  WEEKDAY = 'weekday',
  WEEKEND = 'weekend',
  HOLIDAY = 'holiday',
}

export enum PricingStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('venue_pricing')
export class VenuePricing {
  @PrimaryGeneratedColumn({ name: 'pricing_id' })
  pricingId: number;

  @Column({ name: 'venue_id' })
  venueId: number;

  @ManyToOne(() => Venue, (venue) => venue.pricings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;

  @Column({ type: 'enum', enum: DayType, name: 'day_type' })
  dayType: DayType;

  @Column({ type: 'time', name: 'start_time' })
  startTime: string;

  @Column({ type: 'time', name: 'end_time' })
  endTime: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'enum', enum: PricingStatus, default: PricingStatus.ACTIVE })
  status: PricingStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
