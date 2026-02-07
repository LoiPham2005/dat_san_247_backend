import { Entity, Column, ManyToOne, JoinColumn, Index, Unique, Relation } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { MatchFinding } from './match-finding.entity';
import { User } from '../../users/entities/user.entity';

export enum MatchParticipantStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED'
}

@Entity('match_participants')
@Unique(['matchFindingId', 'userId'])
export class MatchParticipant extends BaseEntity {
    @Column({ name: 'match_finding_id', type: 'uuid' })
    @Index()
    matchFindingId: string;

    @Column({ name: 'user_id', type: 'uuid' })
    @Index()
    userId: string;

    @Column({
        type: 'enum',
        enum: MatchParticipantStatus,
        default: MatchParticipantStatus.PENDING
    })
    status: MatchParticipantStatus;

    @Column({ type: 'text', nullable: true, comment: 'Personal message when applying to join' })
    message: string;

    @Column({ name: 'is_host', default: false })
    isHost: boolean;

    @Column({ name: 'side', type: 'int', nullable: true, comment: '1 for Team A, 2 for Team B' })
    side: number;

    @ManyToOne(() => MatchFinding, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'match_finding_id' })
    matchFinding: Relation<MatchFinding>;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: Relation<User>;
}
