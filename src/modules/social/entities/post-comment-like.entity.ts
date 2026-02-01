import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { PostComment } from './post-comment.entity';
import { User } from '../../users/entities/user.entity';

@Entity('post_comment_likes')
@Unique(['commentId', 'userId'])
export class PostCommentLike extends BaseEntity {
    @Column({ name: 'comment_id', type: 'uuid' })
    commentId: string;

    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @ManyToOne(() => PostComment, comment => comment.likes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'comment_id' })
    comment: PostComment;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
}
