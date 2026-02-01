import { Entity, Column, ManyToOne, JoinColumn, Index, Unique, VersionColumn } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('wallets')
@Unique(['userId'])
export class Wallet extends BaseEntity {
    @Column({ name: 'user_id', type: 'uuid' })
    @Index()
    userId: string;

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    balance: number;

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, comment: 'Money locked for pending bookings/withdrawals' })
    lockedBalance: number;

    @Column({ name: 'currency', default: 'VND' })
    currency: string;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @Column({ name: 'payout_info', type: 'jsonb', nullable: true, comment: 'Bank info for withdrawals' })
    payoutInfo: {
        bankName: string;
        accountNumber: string;
        accountHolder: string;
    };

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @VersionColumn()
    version: number;
}
