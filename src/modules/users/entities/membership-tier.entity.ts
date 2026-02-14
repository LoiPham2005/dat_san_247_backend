import { Entity, Column, OneToMany, Relation } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('membership_tiers')
export class MembershipTier extends BaseEntity {
    @Column({ length: 100 })
    name: string;

    @Column({ length: 100, unique: true })
    slug: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ name: 'min_spending', type: 'decimal', precision: 15, scale: 2, default: 0 })
    minSpending: number;

    @Column({ name: 'discount_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
    discountPercentage: number;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @OneToMany(() => User, (user) => user.membershipTier)
    users: Relation<User>[];
}
