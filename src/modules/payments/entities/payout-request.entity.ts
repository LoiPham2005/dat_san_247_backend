import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Team } from '../../social/entities/team.entity';

export enum PayoutStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED'
}

@Entity('payout_requests')
export class PayoutRequest extends BaseEntity {
    @Column({ name: 'user_id', type: 'uuid' })
    @Index()
    userId: string;

    @Column({ name: 'team_id', type: 'uuid', nullable: true, comment: 'If payout is for a team prize' })
    @Index()
    teamId: string;

    @Column({ type: 'decimal', precision: 15, scale: 2 })
    amount: number;

    @Column({ name: 'currency', default: 'VND' })
    currency: string;

    @Column({
        type: 'enum',
        enum: PayoutStatus,
        default: PayoutStatus.PENDING,
    })
    @Index()
    status: PayoutStatus;

    // Bank Details at the time of request
    @Column({ type: 'jsonb' })
    bankDetails: {
        bankName: string;
        accountNumber: string;
        accountHolder: string;
    };

    @Column({ name: 'admin_note', type: 'text', nullable: true })
    adminNote: string;

    @Column({ name: 'rejection_reason', type: 'text', nullable: true })
    rejectionReason: string;

    @Column({ name: 'proof_image_url', type: 'text', nullable: true, comment: 'Bank transfer receipt image' })
    proofImageUrl: string;

    @Column({ name: 'processed_at', type: 'timestamp', nullable: true })
    processedAt: Date;

    @Column({ name: 'processed_by', type: 'uuid', nullable: true })
    processedById: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Team, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'team_id' })
    team: Team;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'processed_by' })
    processedBy: User;
}
