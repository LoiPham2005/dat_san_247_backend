import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index, Unique, Relation } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { TeamPrivacy } from '../../../common/constants/social.constant';
import { User } from '../../users/entities/user.entity';
import { TeamMember } from './team-member.entity';
import { TeamJoinRequest } from './team-join-request.entity';
import { TeamInvitation } from './team-invitation.entity';

@Entity('teams')
export class Team extends BaseEntity {
    @Column({ length: 255 })
    name: string;

    @Column({ length: 255, unique: true })
    @Index()
    slug: string;

    @Column({ name: 'invitation_code', length: 12, unique: true, nullable: true })
    @Index()
    invitationCode: string;

    @Column({ name: 'avatar_url', type: 'text', nullable: true })
    avatarUrl: string;

    @Column({ name: 'cover_url', type: 'text', nullable: true })
    coverUrl: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    // Team info
    @Column({ name: 'sport_type' })
    @Index()
    sportType: string;

    @Column({ name: 'skill_level', length: 50, nullable: true })
    skillLevel: string;

    @Column({ nullable: true, length: 255 })
    location: string;

    @Column({ nullable: true, length: 100 })
    city: string;

    @Column({ nullable: true, length: 100 })
    district: string;

    // Settings
    @Column({
        type: 'enum',
        enum: TeamPrivacy,
        default: TeamPrivacy.PUBLIC,
    })
    @Index()
    privacy: TeamPrivacy;

    @Column({ name: 'max_members', default: 20 })
    maxMembers: number;

    @Column({ name: 'min_members', default: 5 })
    minMembers: number;

    // Stats
    @Column({ name: 'total_members', default: 0 })
    totalMembers: number;

    @Column({ name: 'total_matches', default: 0 })
    totalMatches: number;

    @Column({ name: 'total_wins', default: 0 })
    totalWins: number;

    @Column({ name: 'rank_score', default: 1000, comment: 'Elo/Skill ranking score for the team' })
    rankScore: number;

    @Column({ name: 'is_looking_for_members', default: true })
    isLookingForMembers: boolean;

    @Column({ name: 'is_verified', default: false })
    isVerified: boolean;

    @Column({ name: 'is_official', default: false, comment: 'For professional/league clubs' })
    isOfficial: boolean;

    @Column({ name: 'created_by', type: 'uuid' })
    createdById: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'created_by' })
    createdBy: Relation<User>;

    @OneToMany(() => TeamMember, member => member.team)
    members: Relation<TeamMember>[];

    @OneToMany(() => TeamJoinRequest, request => request.team)
    joinRequests: Relation<TeamJoinRequest>[];

    @OneToMany(() => TeamInvitation, invitation => invitation.team)
    invitations: Relation<TeamInvitation>[];
}
