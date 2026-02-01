import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { MatchFinding } from './match-finding.entity';
import { Transaction } from '../../payments/entities/transaction.entity';

@Entity('match_escrows')
export class MatchEscrow extends BaseEntity {
    @Column({ name: 'match_finding_id', type: 'uuid' })
    @Index()
    matchFindingId: string;

    @Column({ type: 'decimal', precision: 15, scale: 2 })
    totalAmount: number;

    @Column({ name: 'creator_deposit', type: 'decimal', precision: 15, scale: 2 })
    creatorDeposit: number;

    @Column({ name: 'joiner_deposit', type: 'decimal', precision: 15, scale: 2 })
    joinerDeposit: number;

    @Column({ name: 'status', default: 'PENDING' }) // PENDING, FUNDED, COMPLETED, REFUNDED, DISPUTED
    status: string;

    @Column({ name: 'release_date', type: 'timestamp', nullable: true })
    releaseDate: Date;

    @ManyToOne(() => MatchFinding, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'match_finding_id' })
    matchFinding: MatchFinding;

    @Column({ name: 'creator_transaction_id', type: 'uuid', nullable: true })
    creatorTransactionId: string;

    @Column({ name: 'joiner_transaction_id', type: 'uuid', nullable: true })
    joinerTransactionId: string;

    @ManyToOne(() => Transaction, { nullable: true })
    @JoinColumn({ name: 'creator_transaction_id' })
    creatorTransaction: Transaction;

    @ManyToOne(() => Transaction, { nullable: true })
    @JoinColumn({ name: 'joiner_transaction_id' })
    joinerTransaction: Transaction;
}
