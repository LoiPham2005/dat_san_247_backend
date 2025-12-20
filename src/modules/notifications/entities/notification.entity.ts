// =====================================================
// 12. NOTIFICATION ENTITY
// =====================================================
// modules/notifications/entities/notification.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
  BOOKING = 'booking',
  PAYMENT = 'payment',
  PROMOTION = 'promotion',
  SYSTEM = 'system',
  REVIEW = 'review',
}

export enum SentVia {
  PUSH = 'push',
  EMAIL = 'email',
  SMS = 'sms',
  IN_APP = 'in_app',
}

@Entity('notifications')
@Index(['userId', 'isRead'])
@Index(['notificationType'])
export class Notification extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'notification_type', type: 'enum', enum: NotificationType })
  notificationType: NotificationType;

  @Column({ name: 'related_id', length: 100, nullable: true })
  relatedId?: string;

  @Column({ name: 'related_type', length: 50, nullable: true })
  relatedType?: string;

  @Column({ name: 'image_url', length: 500, nullable: true })
  imageUrl?: string;

  @Column({ name: 'action_url', length: 500, nullable: true })
  actionUrl?: string;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  readAt?: Date;

  @Column({ name: 'sent_via', type: 'enum', enum: SentVia })
  sentVia: SentVia;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}