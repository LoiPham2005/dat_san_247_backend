// src/modules/complaints/entities/complaint.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export enum ComplaintTargetType {
  USER = 'USER',
  FIELD = 'FIELD',
  BOOKING = 'BOOKING',
}

export enum ComplaintStatus {
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
}

@Entity('complaints')
export class Complaint {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => User, user => user.complaints, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: ComplaintTargetType })
  target_type: ComplaintTargetType;

  @Column({ type: 'bigint' })
  target_id: number;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'enum', enum: ComplaintStatus, default: ComplaintStatus.PENDING })
  status: ComplaintStatus;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
