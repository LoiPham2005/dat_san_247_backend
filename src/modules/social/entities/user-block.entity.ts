import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('user_blocks')
@Unique(['userId', 'blockedUserId'])
export class UserBlock extends BaseEntity {
    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @Column({ name: 'blocked_user_id', type: 'uuid' })
    blockedUserId: string;

    @Column({ type: 'text', nullable: true })
    reason: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'blocked_user_id' })
    blockedUser: User;
}
