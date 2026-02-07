import { Entity, Column, ManyToOne, JoinColumn, Index, Unique, Relation } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Venue } from './venue.entity';
import { User } from '../../users/entities/user.entity';

@Entity('venue_blacklist')
@Unique(['venueId', 'userId'])
export class VenueBlacklist extends BaseEntity {
    @Column({ name: 'venue_id', type: 'uuid' })
    @Index()
    venueId: string;

    @Column({ name: 'user_id', type: 'uuid' })
    @Index()
    userId: string;

    @Column({ type: 'text', nullable: true, comment: 'Reason for banning the user from this venue' })
    reason: string;

    @Column({ name: 'banned_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    bannedAt: Date;

    @Column({ name: 'banned_by', type: 'uuid' })
    bannedById: string;

    @ManyToOne(() => Venue, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'venue_id' })
    venue: Relation<Venue>;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: Relation<User>;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'banned_by' })
    bannedBy: Relation<User>;
}
