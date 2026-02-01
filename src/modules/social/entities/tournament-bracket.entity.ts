import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Tournament } from './tournament.entity';

export enum BracketType {
    SINGLE_ELIMINATION = 'SINGLE_ELIMINATION',
    DOUBLE_ELIMINATION = 'DOUBLE_ELIMINATION',
    ROUND_ROBIN = 'ROUND_ROBIN', // Vòng bảng
}

@Entity('tournament_brackets')
export class TournamentBracket extends BaseEntity {
    @Column({ name: 'tournament_id', type: 'uuid' })
    @Index()
    tournamentId: string;

    @Column()
    name: string; // e.g., "Group A", "Knockout Stage"

    @Column({
        type: 'enum',
        enum: BracketType,
        default: BracketType.SINGLE_ELIMINATION,
    })
    type: BracketType;

    @Column({ name: 'order', default: 1 })
    order: number;

    @ManyToOne(() => Tournament, (t) => t.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tournament_id' })
    tournament: Tournament;

    @OneToMany(() => TournamentMatch, (m) => m.bracket)
    matches: TournamentMatch[];
}

@Entity('tournament_matches')
export class TournamentMatch extends BaseEntity {
    @Column({ name: 'bracket_id', type: 'uuid' })
    @Index()
    bracketId: string;

    @Column({ name: 'team_a_id', type: 'uuid', nullable: true })
    teamAId: string;

    @Column({ name: 'team_b_id', type: 'uuid', nullable: true })
    teamBId: string;

    @Column({ name: 'team_a_score', default: 0 })
    teamAScore: number;

    @Column({ name: 'team_b_score', default: 0 })
    teamBScore: number;

    @Column({ name: 'match_date', type: 'timestamp', nullable: true })
    matchDate: Date;

    @Column({ name: 'round_number', default: 1 })
    roundNumber: number;

    @Column({ name: 'winner_id', type: 'uuid', nullable: true })
    winnerId: string;

    @Column({ name: 'status', default: 'PENDING' }) // PENDING, LIVE, FINISHED, CANCELLED
    status: string;

    @Column({ name: 'next_match_id', type: 'uuid', nullable: true, comment: 'ID of the next match in the bracket' })
    nextMatchId: string;

    @ManyToOne(() => TournamentBracket, (b) => b.matches, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'bracket_id' })
    bracket: TournamentBracket;

    @ManyToOne(() => TournamentMatch, { nullable: true })
    @JoinColumn({ name: 'next_match_id' })
    nextMatch: TournamentMatch;
}
