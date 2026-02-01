import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Post } from './post.entity';
import { PostComment } from './post-comment.entity';
import { Team } from './team.entity';
import { MatchFinding } from './match-finding.entity';
import { Friendship } from './friendship.entity';

@Entity('social_notifications')
export class SocialNotification extends BaseEntity {
    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @Column({ length: 50 })
    type: string;

    // Source
    @Column({ name: 'from_user_id', type: 'uuid', nullable: true })
    fromUserId: string;

    // Related entities
    @Column({ name: 'post_id', type: 'uuid', nullable: true })
    postId: string;

    @Column({ name: 'comment_id', type: 'uuid', nullable: true })
    commentId: string;

    @Column({ name: 'team_id', type: 'uuid', nullable: true })
    teamId: string;

    @Column({ name: 'match_finding_id', type: 'uuid', nullable: true })
    matchFindingId: string;

    @Column({ name: 'friendship_id', type: 'uuid', nullable: true })
    friendshipId: string;

    // Content
    @Column({ length: 255 })
    title: string;

    @Column({ type: 'text', nullable: true })
    message: string;

    // Action URL
    @Column({ name: 'action_url', type: 'text', nullable: true })
    actionUrl: string;

    // Status
    @Column({ name: 'is_read', default: false })
    isRead: boolean;

    @Column({ name: 'read_at', type: 'timestamp', nullable: true })
    readAt: Date;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'from_user_id' })
    fromUser: User;

    @ManyToOne(() => Post, { nullable: true })
    @JoinColumn({ name: 'post_id' })
    post: Post;

    @ManyToOne(() => PostComment, { nullable: true })
    @JoinColumn({ name: 'comment_id' })
    comment: PostComment;

    @ManyToOne(() => Team, { nullable: true })
    @JoinColumn({ name: 'team_id' })
    team: Team;

    @ManyToOne(() => MatchFinding, { nullable: true })
    @JoinColumn({ name: 'match_finding_id' })
    matchFinding: MatchFinding;

    @ManyToOne(() => Friendship, { nullable: true })
    @JoinColumn({ name: 'friendship_id' })
    friendship: Friendship;
}
