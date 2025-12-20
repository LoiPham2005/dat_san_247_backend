// =====================================================
// 1. VENUE_OWNER ENTITY
// =====================================================
// modules/venue-owners/entities/venue-owner.entity.ts
import { Entity, Column, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Venue } from '../../venues/entities/venue.entity';

export enum VerificationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('venue_owners')
export class VenueOwner extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @Column({ name: 'business_name', length: 200 })
  businessName: string;

  @Column({ name: 'business_license', length: 100, nullable: true })
  businessLicense?: string;

  @Column({ name: 'tax_code', length: 50, nullable: true })
  taxCode?: string;

  @Column({ name: 'bank_account', length: 50, nullable: true })
  bankAccount?: string;

  @Column({ name: 'bank_name', length: 100, nullable: true })
  bankName?: string;

  @Column({ name: 'bank_branch', length: 100, nullable: true })
  bankBranch?: string;

  @Column({ name: 'id_card_front', length: 500, nullable: true })
  idCardFront?: string;

  @Column({ name: 'id_card_back', length: 500, nullable: true })
  idCardBack?: string;

  @Column({
    name: 'verification_status',
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  verificationStatus: VerificationStatus;

  @Column({ name: 'verified_at', type: 'timestamp', nullable: true })
  verifiedAt?: Date;

  @Column({ name: 'verified_by', type: 'uuid', nullable: true })
  verifiedBy?: string;

  @Column({
    name: 'commission_rate',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 10.0,
  })
  commissionRate: number;

  @Column({
    name: 'rating_average',
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0,
  })
  ratingAverage: number;

  @Column({ name: 'total_venues', default: 0 })
  totalVenues: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Venue, (venue) => venue.owner)
  venues: Venue[];
}
