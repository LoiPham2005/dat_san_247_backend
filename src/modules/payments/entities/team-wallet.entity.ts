import { Entity, Column, ManyToOne, JoinColumn, Index, OneToOne, VersionColumn } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Team } from '../../social/entities/team.entity';

@Entity('team_wallets')
export class TeamWallet extends BaseEntity {
    @Column({ name: 'team_id', type: 'uuid', unique: true })
    @Index()
    teamId: string;

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    balance: number;

    @Column({ name: 'currency', default: 'VND' })
    currency: string;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @Column({ name: 'payout_info', type: 'jsonb', nullable: true, comment: 'Bank info for prize withdrawals' })
    payoutInfo: {
        bankName: string;
        accountNumber: string;
        accountHolder: string;
    };

    @OneToOne(() => Team, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'team_id' })
    team: Team;

    @VersionColumn()
    version: number;
}
