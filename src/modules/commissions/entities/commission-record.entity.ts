// =====================================================
// 19. COMMISSION_RECORD ENTITY
// =====================================================
// modules/commissions/entities/commission-record.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { VenueOwner } from '../../venue-owners/entities/venue-owner.entity';

export enum CommissionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

@Entity('commission_records')
@Index(['bookingId'])
@Index(['ownerId', 'status'])
@Index(['createdAt'])
@Index(['status'])
export class CommissionRecord extends BaseEntity {
  @Column({ name: 'booking_id', type: 'uuid' })
  bookingId: string;

  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId: string;

  @Column({ name: 'booking_amount', type: 'decimal', precision: 15, scale: 2 })
  bookingAmount: number;

  @Column({ name: 'commission_rate', type: 'decimal', precision: 5, scale: 2 })
  commissionRate: number;

  @Column({ name: 'commission_amount', type: 'decimal', precision: 15, scale: 2 })
  commissionAmount: number;

  @Column({ name: 'owner_receives', type: 'decimal', precision: 15, scale: 2 })
  ownerReceives: number;

  @Column({ type: 'enum', enum: CommissionStatus, default: CommissionStatus.PENDING })
  status: CommissionStatus;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;



  @ManyToOne(() => Booking, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @ManyToOne(() => VenueOwner, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: VenueOwner;
}