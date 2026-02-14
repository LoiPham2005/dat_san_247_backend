import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index, Relation } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Tournament } from './tournament.entity';
import { TournamentMatch } from './tournament-match.entity';

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
    tournament: Relation<Tournament>;

    @OneToMany(() => TournamentMatch, (m) => m.bracket)
    matches: Relation<TournamentMatch>[];
}
