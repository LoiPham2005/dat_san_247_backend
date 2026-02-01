import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Post } from './post.entity';
import { User } from '../../users/entities/user.entity';
import { PostCommentLike } from './post-comment-like.entity';

@Entity('post_comments')
export class PostComment extends BaseEntity {
    @Column({ name: 'post_id', type: 'uuid' })
    postId: string;

    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ name: 'parent_comment_id', type: 'uuid', nullable: true })
    parentCommentId: string;

    @Column({ name: 'total_likes', default: 0 })
    totalLikes: number;

    @Column({ name: 'is_edited', default: false })
    isEdited: boolean;

    @Column({ name: 'edited_at', type: 'timestamp', nullable: true })
    editedAt: Date;

    @ManyToOne(() => Post, post => post.comments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'post_id' })
    post: Post;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => PostComment, { nullable: true })
    @JoinColumn({ name: 'parent_comment_id' })
    parentComment: PostComment;

    @OneToMany(() => PostComment, comment => comment.parentComment)
    replies: PostComment[];

    @OneToMany(() => PostCommentLike, like => like.comment)
    likes: PostCommentLike[];
}
