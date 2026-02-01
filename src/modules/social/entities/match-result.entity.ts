import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { MatchFinding } from './match-finding.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { User } from '../../users/entities/user.entity';

@Entity('match_results')
export class MatchResult extends BaseEntity {
    @Column({ name: 'match_finding_id', type: 'uuid' })
    matchFindingId: string;

    @Column({ name: 'booking_id', type: 'uuid', nullable: true })
    bookingId: string;

    // Team A
    @Column({ name: 'team_a_id', type: 'uuid', nullable: true })
    teamAId: string;

    @Column({ name: 'team_a_type', length: 20, nullable: true })
    teamAType: string;

    @Column({ name: 'team_a_score', nullable: true })
    teamAScore: number;

    // Team B
    @Column({ name: 'team_b_id', type: 'uuid', nullable: true })
    teamBId: string;

    @Column({ name: 'team_b_type', length: 20, nullable: true })
    teamBType: string;

    @Column({ name: 'team_b_score', nullable: true })
    teamBScore: number;

    // Result
    @Column({ name: 'winner_id', type: 'uuid', nullable: true })
    winnerId: string;

    @Column({ name: 'is_draw', default: false })
    isDraw: boolean;

    // Stats
    @Column({ name: 'duration_minutes', nullable: true })
    durationMinutes: number;

    @Column({ name: 'mvp_user_id', type: 'uuid', nullable: true })
    mvpUserId: string;

    // Verification
    @Column({ name: 'verified_by', type: 'jsonb', nullable: true })
    verifiedBy: string[];

    @Column({ name: 'is_verified', default: false })
    isVerified: boolean;

    @Column({ name: 'played_at', type: 'timestamp', nullable: true })
    playedAt: Date;

    @ManyToOne(() => MatchFinding, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'match_finding_id' })
    matchFinding: MatchFinding;

    @ManyToOne(() => Booking, { nullable: true })
    @JoinColumn({ name: 'booking_id' })
    booking: Booking;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'mvp_user_id' })
    mvpUser: User;
}
