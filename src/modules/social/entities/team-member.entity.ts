import { Entity, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { TeamMemberStatus } from '../../../common/constants/social.constant';
import { ChatMemberRole } from '../../../common/constants/chat.constant';
import { Team } from './team.entity';
import { User } from '../../users/entities/user.entity';

@Entity('team_members')
@Unique(['teamId', 'userId'])
export class TeamMember extends BaseEntity {
    @Column({ name: 'team_id', type: 'uuid' })
    @Index()
    teamId: string;

    @Column({ name: 'user_id', type: 'uuid' })
    @Index()
    userId: string;

    // Role
    @Column({
        type: 'enum',
        enum: ChatMemberRole,
        default: ChatMemberRole.MEMBER,
    })
    role: ChatMemberRole;

    @Column({ nullable: true, length: 100 })
    position: string;

    @Column({ name: 'jersey_number', nullable: true })
    jerseyNumber: number;

    // Status
    @Column({
        type: 'enum',
        enum: TeamMemberStatus,
        default: TeamMemberStatus.ACTIVE,
    })
    status: TeamMemberStatus;

    // Stats
    @Column({ name: 'matches_played', default: 0 })
    matchesPlayed: number;

    @Column({ name: 'goals_scored', default: 0 })
    goalsScored: number;

    @Column({ name: 'joined_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    joinedAt: Date;

    @Column({ name: 'left_at', type: 'timestamp', nullable: true })
    leftAt: Date;

    @ManyToOne(() => Team, team => team.members, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'team_id' })
    team: Team;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
}
