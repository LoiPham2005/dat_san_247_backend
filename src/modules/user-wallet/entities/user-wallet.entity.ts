import { User } from 'src/modules/auth/entities/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum WalletStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  CLOSED = 'closed',
}

@Entity('user_wallet')
export class UserWallet {
  @PrimaryGeneratedColumn({ name: 'wallet_id' })
  walletId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.wallet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'total_earned' })
  totalEarned: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'total_spent' })
  totalSpent: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'frozen_amount' })
  frozenAmount: number;

  @Column({ length: 3, default: 'VND' })
  currency: string;

  @Column({ type: 'enum', enum: WalletStatus, default: WalletStatus.ACTIVE })
  status: WalletStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
