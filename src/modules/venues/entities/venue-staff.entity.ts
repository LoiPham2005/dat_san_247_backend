import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    Unique,
    Relation,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Venue } from './venue.entity';
import { User } from '../../users/entities/user.entity';

export enum VenueStaffRole {
    OWNER = 'OWNER',
    MANAGER = 'MANAGER',
    STAFF = 'STAFF',
    RECEPTIONIST = 'RECEPTIONIST'
}

@Entity('venue_staff')
@Unique(['venueId', 'userId'])
export class VenueStaff extends BaseEntity {
    @Column({ name: 'venue_id' })
    venueId: string;

    @Column({ name: 'user_id' })
    userId: string;

    @Column({
        name: 'role',
        type: 'enum',
        enum: VenueStaffRole,
        default: VenueStaffRole.STAFF,
        comment: 'OWNER, MANAGER, STAFF, RECEPTIONIST'
    })
    role: VenueStaffRole;

    @Column({ name: 'assigned_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    assignedAt: Date;

    @ManyToOne(() => Venue, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'venue_id' })
    venue: Relation<Venue>;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: Relation<User>;
}
