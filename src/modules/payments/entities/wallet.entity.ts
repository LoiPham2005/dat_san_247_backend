import { Entity, Column, ManyToOne, JoinColumn, Index, Unique, VersionColumn } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum WalletOwnerType {
    USER = 'USER',
    TEAM = 'TEAM'
}

@Entity('wallets')
@Unique(['ownerType', 'ownerId'])
export class Wallet extends BaseEntity {
    @Column({ name: 'owner_type', type: 'enum', enum: WalletOwnerType, default: WalletOwnerType.USER })
    ownerType: WalletOwnerType;

    @Column({ name: 'owner_id', type: 'uuid' })
    @Index()
    ownerId: string;

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

    @VersionColumn()
    version: number;
}
