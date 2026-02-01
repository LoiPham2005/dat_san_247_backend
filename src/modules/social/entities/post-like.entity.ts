import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Post } from './post.entity';
import { User } from '../../users/entities/user.entity';

@Entity('post_likes')
@Unique(['postId', 'userId'])
export class PostLike extends BaseEntity {
    @Column({ name: 'post_id', type: 'uuid' })
    postId: string;

    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @ManyToOne(() => Post, post => post.likes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'post_id' })
    post: Post;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
}
