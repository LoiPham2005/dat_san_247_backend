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

export enum NotificationType {
  BOOKING = 'booking',
  PAYMENT = 'payment',
  PROMOTION = 'promotion',
  SYSTEM = 'system',
  REMINDER = 'reminder',
  PARTNER = 'partner',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn({ name: 'notification_id' })
  notificationId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'enum', enum: NotificationType, name: 'notification_type' })
  notificationType: NotificationType;

  @Column({ type: 'int', nullable: true, name: 'related_id' })
  relatedId?: number;

  @Column({ length: 500, nullable: true, name: 'image_url' })
  imageUrl?: string;

  @Column({ length: 500, nullable: true, name: 'deep_link' })
  deepLink?: string;

  @Column({ type: 'boolean', default: false, name: 'is_read' })
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'read_at' })
  readAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
