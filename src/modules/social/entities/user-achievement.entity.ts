import { Entity, Column, ManyToOne, JoinColumn, Unique, Relation } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('user_achievements')
@Unique(['userId', 'achievementType'])
export class UserAchievement extends BaseEntity {
    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @Column({ name: 'achievement_type', length: 100 })
    achievementType: string;

    @Column({ length: 255 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ name: 'icon_url', type: 'text', nullable: true })
    iconUrl: string;

    @Column({ name: 'earned_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    earnedAt: Date;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: Relation<User>;
}
