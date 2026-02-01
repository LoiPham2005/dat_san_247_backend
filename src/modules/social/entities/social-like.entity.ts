import { Entity, Column, ManyToOne, JoinColumn, Unique, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum LikeTargetType {
    POST = 'POST',
    COMMENT = 'COMMENT',
    MATCH_RESULT = 'MATCH_RESULT', // Added to support high-performance interaction for highlights
    TOURNAMENT = 'TOURNAMENT', // For upcoming social features
    REVIEW = 'REVIEW'
}

@Entity('social_likes')
@Unique(['userId', 'targetType', 'targetId'])
export class SocialLike extends BaseEntity {
    @Column({ name: 'user_id', type: 'uuid' })
    @Index()
    userId: string;

    @Column({
        name: 'target_type',
        type: 'enum',
        enum: LikeTargetType,
    })
    @Index()
    targetType: LikeTargetType;

    @Column({ name: 'target_id', type: 'uuid' })
    @Index()
    targetId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
}
