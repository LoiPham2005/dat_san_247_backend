import { Entity, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Tournament } from './tournament.entity';
import { User } from '../../users/entities/user.entity';
import { Team } from './team.entity';

export enum ParticipantType {
    INDIVIDUAL = 'INDIVIDUAL',
    TEAM = 'TEAM'
}

export enum ParticipantStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    WAITLISTED = 'WAITLISTED',
    ELIMINATED = 'ELIMINATED',
    WITHDRAWN = 'WITHDRAWN',
}

@Entity('tournament_participants')
@Unique(['tournamentId', 'userId', 'teamId'])
export class TournamentParticipant extends BaseEntity {
    @Column({ name: 'tournament_id', type: 'uuid' })
    @Index()
    tournamentId: string;

    @Column({
        type: 'enum',
        enum: ParticipantType,
        default: ParticipantType.INDIVIDUAL
    })
    type!: ParticipantType;

    @Column({ name: 'user_id', type: 'uuid', nullable: true })
    userId!: string;

    @Column({ name: 'team_id', type: 'uuid', nullable: true })
    teamId!: string;

    @Column({
        type: 'enum',
        enum: ParticipantStatus,
        default: ParticipantStatus.PENDING,
    })
    status!: ParticipantStatus;

    @Column({ name: 'fee_paid', default: false })
    feePaid!: boolean;

    @Column({ name: 'payment_transaction_id', nullable: true })
    paymentTransactionId?: string;

    @Column({ name: 'seed_number', nullable: true })
    seedNumber: number;

    @Column({ name: 'final_rank', nullable: true })
    finalRank: number;

    @ManyToOne(() => Tournament, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tournament_id' })
    tournament: Tournament;

    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Team, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'team_id' })
    team: Team;
}
