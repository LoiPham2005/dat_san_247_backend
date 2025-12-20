// =====================================================
// 23. UPDATE VENUE ENTITY WITH COMPLETE RELATIONS
// =====================================================
// modules/venues/entities/venue.entity.ts (UPDATED)
import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { VenueOwner } from '../../venue-owners/entities/venue-owner.entity';
import { Court } from '../../courts/entities/court.entity';
import { Review } from '../../reviews/entities/review.entity';
import { VenueImage } from './venue-image.entity';
import { Favorite } from '../../favorites/entities/favorite.entity';

export enum VenueStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

@Entity('venues')
@Index(['ownerId'])
@Index(['slug'])
@Index(['city', 'district'])
@Index(['status', 'featured'])
export class Venue extends BaseEntity {
  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId: string;

  @Column({ name: 'venue_name', length: 200 })
  venueName: string;

  @Column({ unique: true, length: 250 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ length: 500 })
  address: string;

  @Column({ length: 100 })
  ward: string;

  @Column({ length: 100 })
  district: string;

  @Column({ length: 100 })
  city: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude?: number;

  @Column({ length: 20 })
  phone: string;

  @Column({ length: 255, nullable: true })
  email?: string;

  @Column({ length: 500, nullable: true })
  website?: string;

  @Column({ name: 'opening_time', type: 'time' })
  openingTime: string;

  @Column({ name: 'closing_time', type: 'time' })
  closingTime: string;

  @Column({ name: 'is_24h', default: false })
  is24h: boolean;

  @Column({ name: 'parking_available', default: false })
  parkingAvailable: boolean;

  @Column({ name: 'wifi_available', default: false })
  wifiAvailable: boolean;

  @Column({ name: 'shower_available', default: false })
  showerAvailable: boolean;

  @Column({ name: 'locker_available', default: false })
  lockerAvailable: boolean;

  @Column({ name: 'cafe_available', default: false })
  cafeAvailable: boolean;

  @Column({ name: 'equipment_rental', default: false })
  equipmentRental: boolean;

  @Column({ type: 'enum', enum: VenueStatus, default: VenueStatus.PENDING })
  status: VenueStatus;

  @Column({ name: 'rating_average', type: 'decimal', precision: 3, scale: 2, default: 0 })
  ratingAverage: number;

  @Column({ name: 'total_reviews', default: 0 })
  totalReviews: number;

  @Column({ name: 'total_bookings', default: 0 })
  totalBookings: number;

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @Column({ default: false })
  featured: boolean;

  @Column({ default: false })
  verified: boolean;

  @ManyToOne(() => VenueOwner, (owner) => owner.venues)
  @JoinColumn({ name: 'owner_id' })
  owner: VenueOwner;

  @OneToMany(() => Court, (court) => court.venue)
  courts: Court[];

  @OneToMany(() => Review, (review) => review.venue)
  reviews: Review[];

  @OneToMany(() => VenueImage, (image) => image.venue)
  images: VenueImage[];

  @OneToMany(() => Favorite, (favorite) => favorite.venue)
  favorites: Favorite[];
}