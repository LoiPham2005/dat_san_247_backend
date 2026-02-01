import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Team } from './team.entity';
import { User } from '../../users/entities/user.entity';

@Entity('team_invitations')
@Unique(['teamId', 'invitedUserId'])
export class TeamInvitation extends BaseEntity {
    @Column({ name: 'team_id', type: 'uuid' })
    teamId: string;

    @Column({ name: 'invited_user_id', type: 'uuid' })
    invitedUserId: string;

    @Column({ name: 'invited_by', type: 'uuid' })
    invitedBy: string;

    @Column({ type: 'text', nullable: true })
    message: string;

    @Column({ length: 20, default: 'PENDING' })
    status: string;

    @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
    expiresAt: Date;

    @Column({ name: 'responded_at', type: 'timestamp', nullable: true })
    respondedAt: Date;

    @ManyToOne(() => Team, team => team.invitations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'team_id' })
    team: Team;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'invited_user_id' })
    invitedUser: User;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'invited_by' })
    inviter: User;
}
