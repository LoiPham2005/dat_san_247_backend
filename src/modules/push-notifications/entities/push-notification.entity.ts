import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export enum PushTargetType {
  ALL_USERS = 'all_users',
  SPECIFIC_USERS = 'specific_users',
  VENUE_OWNERS = 'venue_owners',
  CUSTOMERS = 'customers',
  LOCATION_BASED = 'location_based',
}

export enum PushStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  SENDING = 'sending',
  SENT = 'sent',
  FAILED = 'failed',
}

@Entity('push_notifications')
export class PushNotification {
  @PrimaryGeneratedColumn({ name: 'push_id' })
  pushId: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'enum', enum: PushTargetType, name: 'target_type' })
  targetType: PushTargetType;

  @Column({ type: 'json', nullable: true, name: 'target_users' })
  targetUsers?: number[];

  @Column({ type: 'json', nullable: true, name: 'target_conditions' })
  targetConditions?: any;

  @Column({ length: 500, nullable: true, name: 'image_url' })
  imageUrl?: string;

  @Column({ length: 500, nullable: true, name: 'deep_link' })
  deepLink?: string;

  @Column({ type: 'timestamp', nullable: true, name: 'scheduled_at' })
  scheduledAt?: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'sent_at' })
  sentAt?: Date;

  @Column({ type: 'int', default: 0, name: 'total_sent' })
  totalSent: number;

  @Column({ type: 'int', default: 0, name: 'total_delivered' })
  totalDelivered: number;

  @Column({ type: 'int', default: 0, name: 'total_clicked' })
  totalClicked: number;

  @Column({ type: 'enum', enum: PushStatus, default: PushStatus.DRAFT })
  status: PushStatus;

  @Column({ type: 'int', nullable: true, name: 'created_by' })
  createdBy?: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator?: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
