import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum PointTransactionType {
    EARN = 'EARN',
    REDEEM = 'REDEEM',
    EXPIRE = 'EXPIRE',
    REFUND = 'REFUND'
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
