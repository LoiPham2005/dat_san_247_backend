import { Entity, Column, ManyToOne, JoinColumn, Unique, Check } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { FriendStatus } from '../../../common/constants/social.constant';
import { User } from '../../users/entities/user.entity';

@Entity('friendships')
@Unique(['userId', 'friendId'])
export class Friendship extends BaseEntity {
    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @Column({ name: 'friend_id', type: 'uuid' })
    friendId: string;

    @Column({
        type: 'enum',
        enum: FriendStatus,
        default: FriendStatus.PENDING,
    })
    status: FriendStatus;

    @Column({ name: 'requester_id', type: 'uuid' })
    requesterId: string;

    @Column({ name: 'requested_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    requestedAt: Date;

    @Column({ name: 'accepted_at', type: 'timestamp', nullable: true })
    acceptedAt: Date;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'friend_id' })
    friend: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'requester_id' })
    requester: User;
}
