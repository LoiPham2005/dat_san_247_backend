import { Entity, Column, ManyToOne, JoinColumn, Index, Relation } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Transaction } from './transaction.entity';
import { User } from '../../users/entities/user.entity';

export enum DisputeStatus {
    OPEN = 'OPEN',
    IN_PROGRESS = 'IN_PROGRESS',
    RESOLVED = 'RESOLVED',
    REJECTED = 'REJECTED'
}

@Entity('transaction_disputes')
export class TransactionDispute extends BaseEntity {
    @Column({ name: 'transaction_id', type: 'uuid' })
    @Index()
    transactionId: string;

    @Column({ name: 'reporter_id', type: 'uuid' })
    @Index()
    reporterId: string;

    @Column({ type: 'text' })
    reason: string;

    @Column({ name: 'evidence_urls', type: 'jsonb', nullable: true })
    evidenceUrls: string[];

    @Column({
        type: 'enum',
        enum: DisputeStatus,
        default: DisputeStatus.OPEN
    })
    @Index()
    status: DisputeStatus;

    @Column({ name: 'resolution_note', type: 'text', nullable: true })
    resolutionNote: string;

    @Column({ name: 'resolved_at', type: 'timestamp', nullable: true })
    resolvedAt: Date;

    @Column({ name: 'resolved_by', type: 'uuid', nullable: true })
    resolvedById: string;

    @ManyToOne(() => Transaction, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'transaction_id' })
    transaction: Relation<Transaction>;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'reporter_id' })
    reporter: Relation<User>;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'resolved_by' })
    resolvedBy: Relation<User>;
}
