import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('user_followers')
@Unique(['userId', 'followerId'])
export class UserFollower extends BaseEntity {
    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @Column({ name: 'follower_id', type: 'uuid' })
    followerId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'follower_id' })
    follower: User;
}
