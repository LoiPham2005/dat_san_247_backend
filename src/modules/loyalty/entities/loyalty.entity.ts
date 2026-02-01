import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum PointTransactionType {
    EARN = 'EARN',
    REDEEM = 'REDEEM',
    EXPIRE = 'EXPIRE',
    REFUND = 'REFUND'
}

@Entity('user_points')
export class UserPoint extends BaseEntity {
    @Column({ name: 'user_id', type: 'uuid', unique: true })
    @Index()
    userId: string;

    @Column({ name: 'total_points', default: 0 })
    totalPoints: number;

    @Column({ name: 'lifetime_earned_points', default: 0 })
    lifetimeEarnedPoints: number;

    @Column({ name: 'tier', default: 'BRONZE', comment: 'BRONZE, SILVER, GOLD, PLATINUM' })
    tier: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
}

@Entity('point_transactions')
export class PointTransaction extends BaseEntity {
    @Column({ name: 'user_id', type: 'uuid' })
    @Index()
    userId: string;

    @Column({ type: 'int' })
    points: number;

    @Column({
        type: 'enum',
        enum: PointTransactionType
    })
    type: PointTransactionType;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ name: 'reference_id', nullable: true, comment: 'Booking ID or Promotion ID' })
    referenceId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
}
