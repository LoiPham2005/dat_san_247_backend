import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Venue } from '../../venues/entities/venue.entity';

@Entity('venue_memberships')
export class VenueMembership extends BaseEntity {
    @Column({ name: 'venue_id', type: 'uuid' })
    @Index()
    venueId: string;

    @Column({ name: 'user_id', type: 'uuid' })
    @Index()
    userId: string;

    @Column()
    name: string; // e.g., "Silver Member", "Gold Member"

    @Column({ name: 'tier', default: 1 })
    tier: number;

    @Column({ name: 'discount_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
    discountPercentage: number;

    @Column({ name: 'start_date', type: 'date' })
    startDate: Date;

    @Column({ name: 'end_date', type: 'date', nullable: true })
    endDate: Date;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @Column({ name: 'benefits', type: 'jsonb', nullable: true, comment: 'Benefits like free water, towels, etc.' })
    benefits: any;

    @ManyToOne(() => Venue, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'venue_id' })
    venue: Venue;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
}
