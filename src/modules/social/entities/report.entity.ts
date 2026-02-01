import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { ReportType, ReportReason, ReportStatus } from '../../../common/constants/social.constant';
import { User } from '../../users/entities/user.entity';
import { Post } from './post.entity';
import { PostComment } from './post-comment.entity';
import { Message } from '../../chat/entities/message.entity';
import { Team } from './team.entity';

@Entity('reports')
export class Report extends BaseEntity {
    // Reporter
    @Column({ name: 'reporter_id', type: 'uuid' })
    reporterId: string;

    // What is being reported
    @Column({
        name: 'report_type',
        type: 'enum',
        enum: ReportType,
    })
    reportType: ReportType;

    @Column({ name: 'reported_user_id', type: 'uuid', nullable: true })
    reportedUserId: string;

    @Column({ name: 'reported_post_id', type: 'uuid', nullable: true })
    reportedPostId: string;

    @Column({ name: 'reported_comment_id', type: 'uuid', nullable: true })
    reportedCommentId: string;

    @Column({ name: 'reported_message_id', type: 'uuid', nullable: true })
    reportedMessageId: string;

    @Column({ name: 'reported_team_id', type: 'uuid', nullable: true })
    reportedTeamId: string;

    // Report details
    @Column({
        type: 'enum',
        enum: ReportReason,
    })
    reason: ReportReason;

    @Column({ type: 'text', nullable: true })
    description: string;

    // Status
    @Column({
        type: 'enum',
        enum: ReportStatus,
        default: ReportStatus.PENDING,
    })
    status: ReportStatus;

    // Review
    @Column({ name: 'reviewed_by', type: 'uuid', nullable: true })
    reviewedBy: string;

    @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
    reviewedAt: Date;

    @Column({ name: 'action_taken', type: 'text', nullable: true })
    actionTaken: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'reporter_id' })
    reporter: User;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'reported_user_id' })
    reportedUser: User;

    @ManyToOne(() => Post, { nullable: true })
    @JoinColumn({ name: 'reported_post_id' })
    reportedPost: Post;

    @ManyToOne(() => PostComment, { nullable: true })
    @JoinColumn({ name: 'reported_comment_id' })
    reportedComment: PostComment;

    @ManyToOne(() => Message, { nullable: true })
    @JoinColumn({ name: 'reported_message_id' })
    reportedMessage: Message;

    @ManyToOne(() => Team, { nullable: true })
    @JoinColumn({ name: 'reported_team_id' })
    reportedTeam: Team;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'reviewed_by' })
    reviewer: User;
}
