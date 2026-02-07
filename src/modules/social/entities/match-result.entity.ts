import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index, Relation } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { MatchFinding } from './match-finding.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { User } from '../../users/entities/user.entity';
import { Team } from './team.entity';
import { SocialMedia } from './social-media.entity';

@Entity('match_results')
export class MatchResult extends BaseEntity {
    @Column({ name: 'match_finding_id', type: 'uuid' })
    @Index()
    matchFindingId: string;

    @Column({ name: 'booking_id', type: 'uuid', nullable: true })
    bookingId: string;

    // Team A
    @Column({ name: 'team_a_id', type: 'uuid', nullable: true })
    teamAId: string;

    @Column({ name: 'team_a_score', default: 0 })
    teamAScore: number;

    // Team B
    @Column({ name: 'team_b_id', type: 'uuid', nullable: true })
    teamBId: string;

    @Column({ name: 'team_b_score', default: 0 })
    teamBScore: number;

    // Premium Social Features
    @OneToMany(() => SocialMedia, (media) => media.ownerId)
    media: Relation<SocialMedia>[];

    @Column({ name: 'highlight_video_url', type: 'text', nullable: true })
    highlightVideoUrl: string;

    @Column({ name: 'stats', type: 'jsonb', nullable: true, comment: 'Game stats: goals, shots, etc.' })
    stats: any;

    @Column({ name: 'mvp_user_id', type: 'uuid', nullable: true })
    mvpUserId: string;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @ManyToOne(() => MatchFinding, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'match_finding_id' })
    matchFinding: Relation<MatchFinding>;

    @ManyToOne(() => Booking, { nullable: true })
    @JoinColumn({ name: 'booking_id' })
    booking: Relation<Booking>;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'mvp_user_id' })
    mvpUser: Relation<User>;

    @ManyToOne(() => Team, { nullable: true })
    @JoinColumn({ name: 'team_a_id' })
    teamA: Relation<Team>;

    @ManyToOne(() => Team, { nullable: true })
    @JoinColumn({ name: 'team_b_id' })
    teamB: Relation<Team>;
}
