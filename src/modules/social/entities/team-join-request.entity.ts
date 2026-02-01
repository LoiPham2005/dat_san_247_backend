import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Team } from './team.entity';
import { User } from '../../users/entities/user.entity';

@Entity('team_join_requests')
@Unique(['teamId', 'userId'])
export class TeamJoinRequest extends BaseEntity {
    @Column({ name: 'team_id', type: 'uuid' })
    teamId: string;

    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @Column({ type: 'text', nullable: true })
    message: string;

    @Column({ length: 20, default: 'PENDING' })
    status: string;

    @Column({ name: 'reviewed_by', type: 'uuid', nullable: true })
    reviewedBy: string;

    @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
    reviewedAt: Date;

    @ManyToOne(() => Team, team => team.joinRequests, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'team_id' })
    team: Team;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'reviewed_by' })
    reviewer: User;
}
