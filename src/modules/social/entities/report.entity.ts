import { Entity, Column, ManyToOne, JoinColumn, Index, Relation } from 'typeorm';
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
    @Index()
    reporterId: string;

    @Column({
        name: 'target_type',
        type: 'enum',
        enum: ReportType,
    })
    @Index()
    targetType: ReportType;

    @Column({ name: 'target_id', type: 'uuid' })
    @Index()
    targetId: string;

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
    @Index()
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
    reporter: Relation<User>;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'reviewed_by' })
    reviewer: Relation<User>;
}
