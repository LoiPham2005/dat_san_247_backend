import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { MatchResult } from './match-result.entity';
import { User } from '../../users/entities/user.entity';

export enum MatchEventType {
    GOAL = 'GOAL',
    YELLOW_CARD = 'YELLOW_CARD',
    RED_CARD = 'RED_CARD',
    SUBSTITUTION = 'SUBSTITUTION',
    INJURY = 'INJURY',
    MATCH_START = 'MATCH_START',
    MATCH_END = 'MATCH_END'
}

@Entity('match_events')
export class MatchEvent extends BaseEntity {
    @Column({ name: 'match_result_id', type: 'uuid' })
    @Index()
    matchResultId: string;

    @Column({
        type: 'enum',
        enum: MatchEventType,
    })
    type: MatchEventType;

    @Column({ name: 'minute', type: 'int', nullable: true })
    minute: number;

    @Column({ name: 'player_id', type: 'uuid', nullable: true })
    playerId: string;

    @Column({ name: 'team_side', nullable: true }) // 'A' or 'B'
    teamSide: string;

    @Column({ type: 'jsonb', nullable: true, comment: 'Additional info like assist_by, etc.' })
    metadata: any;

    @ManyToOne(() => MatchResult, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'match_result_id' })
    matchResult: MatchResult;

    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'player_id' })
    player: User;
}
