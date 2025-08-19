// src/auth/entities/refresh-token.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  token: string; // refresh token thực tế

  @Column({ name: 'user_id' })
  userId: number; // FK đến user

  @Column({ nullable: true, name: 'device_info' })
  deviceInfo: string; // thông tin thiết bị (iOS, Android, Web...)

  @Column({ nullable: true, name: 'user_agent' })
  userAgent: string; // browser hoặc app thông tin

  @Column({ nullable: true, name: 'ip_address' })
  ipAddress: string; // IP đăng nhập

  @Column({ default: false, name: 'is_revoked' })
  isRevoked: boolean; // đánh dấu token đã bị vô hiệu hóa

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date; // ngày hết hạn token

  @Column({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt: Date | null; // soft delete nếu muốn giữ lịch sử

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
