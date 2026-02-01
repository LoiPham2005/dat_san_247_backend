import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { MatchStatus, ChallengeType, OrganizerType } from '../../../common/constants/social.constant';
import { Venue } from '../../venues/entities/venue.entity';
import { Court } from '../../courts/entities/court.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { User } from '../../users/entities/user.entity';
import { Team } from './team.entity';

@Entity('match_findings')
export class MatchFinding extends BaseEntity {
    // Organizer logic - Professional Polymorphic style
    @Column({
        name: 'organizer_type',
        type: 'enum',
        enum: OrganizerType,
        default: OrganizerType.USER
    })
    organizerType: OrganizerType;

    @Column({ name: 'organizer_user_id', type: 'uuid', nullable: true })
    organizerUserId: string;

    @Column({ name: 'organizer_team_id', type: 'uuid', nullable: true })
    organizerTeamId: string;

    @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'organizer_user_id' })
    organizerUser: User;

    @ManyToOne(() => Team, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'organizer_team_id' })
    organizerTeam: Team;

    // Match details
    @Column({ name: 'sport_type' })
    @Index()
    sportType: string;

    @Column({
        name: 'challenge_type',
        type: 'enum',
        enum: ChallengeType,
        default: ChallengeType.FRIENDLY,
    })
    challengeType: ChallengeType;

    // Geographic Information - High Performance Radius Search
    @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
    latitude: number;

    @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
    longitude: number;

    @Column({ nullable: true, length: 255 })
    location: string;

    // Venue & Time
    @Column({ name: 'venue_id', type: 'uuid', nullable: true })
    @Index()
    venueId: string;

    @Column({ name: 'court_id', type: 'uuid', nullable: true })
    courtId: string;

    @Column({ name: 'preferred_date', type: 'date', nullable: true })
    preferredDate: Date;

    @Column({ name: 'preferred_time_start', type: 'time', nullable: true })
    preferredTimeStart: string;

    @Column({ name: 'preferred_time_end', type: 'time', nullable: true })
    preferredTimeEnd: string;

    // Match Specs
    @Column({ name: 'team_size', nullable: true })
    teamSize: number;

    @Column({ name: 'entry_fee', type: 'decimal', precision: 10, scale: 2, default: 0, comment: 'Fee per person or per team' })
    entryFee: number;

    @Column({ name: 'skill_level', length: 50, nullable: true })
    skillLevel: string;

    @Column({ name: 'min_skill_level', type: 'int', default: 1 })
    minSkillLevel: number;

    @Column({ name: 'max_skill_level', type: 'int', default: 100 })
    maxSkillLevel: number;

    @Column({ name: 'max_distance', nullable: true, comment: 'Max distance in km for finding' })

    maxDistance: number;

    // Content
    @Column({ nullable: true, length: 255 })
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    // Status
    @Column({
        type: 'enum',
        enum: MatchStatus,
        default: MatchStatus.OPEN,
    })
    @Index()
    status: MatchStatus;

    @Column({ name: 'matched_at', type: 'timestamp', nullable: true })
    matchedAt: Date;

    // Relations
    @Column({ name: 'booking_id', type: 'uuid', nullable: true })
    bookingId: string;

    @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
    expiresAt: Date;

    @ManyToOne(() => Venue, { nullable: true })
    @JoinColumn({ name: 'venue_id' })
    venue: Venue;

    @ManyToOne(() => Court, { nullable: true })
    @JoinColumn({ name: 'court_id' })
    court: Court;

    @ManyToOne(() => Booking, { nullable: true })
    @JoinColumn({ name: 'booking_id' })
    booking: Booking;
}
