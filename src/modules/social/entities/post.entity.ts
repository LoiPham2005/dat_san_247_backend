import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { PostType, PostPrivacy } from '../../../common/constants/social.constant';
import { User } from '../../users/entities/user.entity';
import { Venue } from '../../venues/entities/venue.entity';
import { Team } from './team.entity';
import { MatchResult } from './match-result.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { PostLike } from './post-like.entity';
import { PostComment } from './post-comment.entity';

@Entity('posts')
export class Post extends BaseEntity {
    @Column({ name: 'user_id', type: 'uuid' })
    @Index()
    userId: string;

    @Column({ unique: true, nullable: true })
    @Index()
    slug: string;

    // Share features
    @Column({ name: 'shared_post_id', type: 'uuid', nullable: true })
    sharedPostId: string;

    @ManyToOne(() => Post, { nullable: true })
    @JoinColumn({ name: 'shared_post_id' })
    sharedPost: Post;

    // Post content
    @Column({
        type: 'enum',
        enum: PostType,
        default: PostType.STATUS,
    })
    type: PostType;

    @Column({ type: 'text', nullable: true })
    content: string;

    @Column({ name: 'media_urls', type: 'jsonb', nullable: true })
    mediaUrls: any;

    // Tagging features
    @Column({ name: 'tagged_user_ids', type: 'jsonb', nullable: true, comment: 'IDs of tagged users' })
    taggedUserIds: string[];

    // Context
    @Column({ name: 'venue_id', type: 'uuid', nullable: true })
    venueId: string;

    @Column({ name: 'team_id', type: 'uuid', nullable: true })
    teamId: string;

    @Column({ name: 'match_result_id', type: 'uuid', nullable: true })
    matchResultId: string;

    @Column({ name: 'booking_id', type: 'uuid', nullable: true })
    bookingId: string;

    // Geographic check-in
    @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
    latitude: number;

    @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
    longitude: number;

    @Column({ nullable: true, length: 255 })
    locationName: string;

    // Privacy
    @Column({
        type: 'enum',
        enum: PostPrivacy,
        default: PostPrivacy.PUBLIC,
    })
    privacy: PostPrivacy;

    // Engagement
    @Column({ name: 'total_likes', default: 0 })
    totalLikes: number;

    @Column({ name: 'total_comments', default: 0 })
    totalComments: number;

    @Column({ name: 'total_shares', default: 0 })
    totalShares: number;

    // Moderation
    @Column({ name: 'is_reported', default: false })
    isReported: boolean;

    @Column({ name: 'is_hidden', default: false })
    isHidden: boolean;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Venue, { nullable: true })
    @JoinColumn({ name: 'venue_id' })
    venue: Venue;

    @ManyToOne(() => Team, { nullable: true })
    @JoinColumn({ name: 'team_id' })
    team: Team;

    @ManyToOne(() => MatchResult, { nullable: true })
    @JoinColumn({ name: 'match_result_id' })
    matchResult: MatchResult;

    @ManyToOne(() => Booking, { nullable: true })
    @JoinColumn({ name: 'booking_id' })
    booking: Booking;

    @OneToMany(() => PostLike, like => like.post)
    likes: PostLike[];

    @OneToMany(() => PostComment, comment => comment.post)
    comments: PostComment[];
}
