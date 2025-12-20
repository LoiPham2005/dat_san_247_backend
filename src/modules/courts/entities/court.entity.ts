// =====================================================
// 5. COURT ENTITY
// =====================================================
// modules/courts/entities/court.entity.ts
import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Venue } from '../../venues/entities/venue.entity';
import { SportType } from '../../sport-types/entities/sport-type.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { PricingRule } from './pricing-rule.entity';

export enum CourtStatus {
  ACTIVE = 'active',
  MAINTENANCE = 'maintenance',
  INACTIVE = 'inactive',
}

@Entity('courts')
@Index(['venueId'])
@Index(['sportTypeId'])
@Index(['status'])
export class Court extends BaseEntity {
  @Column({ name: 'venue_id', type: 'uuid' })
  venueId: string;

  @Column({ name: 'sport_type_id', type: 'uuid' })
  sportTypeId: string;

  @Column({ name: 'court_name', length: 100 })
  courtName: string;

  @Column({ name: 'court_size', length: 50, nullable: true })
  courtSize?: string;

  @Column({ name: 'surface_type', length: 100, nullable: true })
  surfaceType?: string;

  @Column({ nullable: true })
  capacity?: number;

  @Column({ name: 'is_indoor', default: false })
  isIndoor: boolean;

  @Column({ name: 'has_lighting', default: true })
  hasLighting: boolean;

  @Column({ name: 'has_air_conditioning', default: false })
  hasAirConditioning: boolean;

  @Column({ type: 'enum', enum: CourtStatus, default: CourtStatus.ACTIVE })
  status: CourtStatus;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'image_url', length: 500, nullable: true })
  imageUrl?: string;

  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  @ManyToOne(() => Venue, (venue) => venue.courts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;

  @ManyToOne(() => SportType, (sportType) => sportType.courts)
  @JoinColumn({ name: 'sport_type_id' })
  sportType: SportType;

  @OneToMany(() => Booking, (booking) => booking.court)
  bookings: Booking[];

  @OneToMany(() => PricingRule, (pricing) => pricing.court)
  pricingRules: PricingRule[];
}