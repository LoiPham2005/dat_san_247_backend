// =====================================================
// 20. WITHDRAWAL_REQUEST ENTITY
// =====================================================
// modules/withdrawals/entities/withdrawal-request.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { VenueOwner } from '../../venue-owners/entities/venue-owner.entity';
import { StaffProfile } from '../../staff/entities/staff-profile.entity';

export enum WithdrawalStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('withdrawal_requests')
@Index(['ownerId'])
@Index(['requestCode'])
@Index(['status'])
@Index(['createdAt'])
export class WithdrawalRequest extends BaseEntity {
  @Column({ name: 'request_code', unique: true, length: 50 })
  requestCode: string;

  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ name: 'bank_account', length: 50 })
  bankAccount: string;

  @Column({ name: 'bank_name', length: 100 })
  bankName: string;

  @Column({ name: 'account_holder', length: 100 })
  accountHolder: string;

  @Column({ type: 'enum', enum: WithdrawalStatus, default: WithdrawalStatus.PENDING })
  status: WithdrawalStatus;

  @Column({ name: 'processed_by', type: 'uuid', nullable: true })
  processedBy?: string;

  @Column({ name: 'processed_at', type: 'timestamp', nullable: true })
  processedAt?: Date;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason?: string;

  @Column({ name: 'transfer_reference', length: 100, nullable: true })
  transferReference?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(() => VenueOwner)
  @JoinColumn({ name: 'owner_id' })
  owner: VenueOwner;

  @ManyToOne(() => StaffProfile, { nullable: true })
  @JoinColumn({ name: 'processed_by' })
  processor?: StaffProfile;
}