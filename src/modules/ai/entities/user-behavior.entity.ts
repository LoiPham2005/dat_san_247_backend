import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Venue } from '../../venues/entities/venue.entity';
import { Court } from 'src/modules/courts/entities/court.entity';

@Entity('user_behaviors')
export class UserBehavior extends BaseEntity {
    @Column({ name: 'user_id' })
    @Index()
    userId: string;

    @Column({ name: 'action_type' })
    actionType: string;

    @Column({ name: 'venue_id', nullable: true })
    venueId: string;

    @Column({ name: 'court_id', nullable: true })
    courtId: string;

    @Column({ name: 'sport_type', nullable: true })
    sportType: string;

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>;

    @Column({ name: 'session_id', nullable: true })
    sessionId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Venue, { nullable: true })
    @JoinColumn({ name: 'venue_id' })
    venue: Venue;

    @ManyToOne(() => Court, { nullable: true })
    @JoinColumn({ name: 'court_id' })
    court: Court;
}
