// src/modules/notifications/entities/notification.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => User, user => user.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'boolean', default: false })
  is_read: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
