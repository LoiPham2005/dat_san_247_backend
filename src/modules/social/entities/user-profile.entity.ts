import { Entity, Column, ManyToOne, JoinColumn, Unique, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('user_profiles')
@Unique(['userId'])
export class UserProfile extends BaseEntity {
    @Column({ name: 'user_id', type: 'uuid' })
    @Index()
    userId: string;

    // Bio
    @Column({ type: 'text', nullable: true })
    bio: string;

    @Column({ name: 'cover_url', type: 'text', nullable: true })
    coverUrl: string;

    // Sports preferences
    @Column({ name: 'favorite_sports', type: 'jsonb', nullable: true })
    favoriteSports: string[];

    @Column({ name: 'skill_levels', type: 'jsonb', nullable: true, comment: 'e.g., {FOOTBALL: "pro", TENNIS: "beginner"}' })
    skillLevels: Record<string, string>;

    // Geographic - Last known or home location for smart matching
    @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
    latitude: number;

    @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
    longitude: number;

    // Gamification & Ranking - The "Mạnh nhất" part
    @Column({ name: 'rank_score', default: 1000, comment: 'Elo/Skill ranking score' })
    rankScore: number;

    @Column({ name: 'level', default: 1 })
    level: number;

    @Column({ name: 'experience_points', default: 0 })
    experiencePoints: number;

    @Column({ name: 'reliability_score', default: 100, comment: 'Score 0-100, decreases when user cancels last minute' })
    reliabilityScore: number;

    // Stats
    @Column({ name: 'total_matches', default: 0 })
    totalMatches: number;

    @Column({ name: 'total_wins', default: 0 })
    totalWins: number;

    @Column({ name: 'total_bookings', default: 0 })
    totalBookings: number;

    @Column({ name: 'total_teams', default: 0 })
    totalTeams: number;

    // Social Stats
    @Column({ name: 'total_friends', default: 0 })
    totalFriends: number;

    @Column({ name: 'total_followers', default: 0 })
    totalFollowers: number;

    @Column({ name: 'total_following', default: 0 })
    totalFollowing: number;

    @Column({ name: 'total_posts', default: 0 })
    totalPosts: number;

    // Settings
    @Column({ name: 'is_profile_public', default: true })
    isProfilePublic: boolean;

    @Column({ name: 'show_email', default: false })
    showEmail: boolean;

    @Column({ name: 'show_phone', default: false })
    showPhone: boolean;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
}
