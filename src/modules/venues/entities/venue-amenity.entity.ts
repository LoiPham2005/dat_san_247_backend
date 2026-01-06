import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Venue } from './venue.entity';

@Entity('venue_amenities')
export class VenueAmenity extends BaseEntity {
    @Column({ name: 'venue_id' })
    venueId: string;

    @Column({ length: 100 })
    name: string;

    @Column({ length: 50, nullable: true })
    icon: string;

    @ManyToOne(() => Venue, (venue) => venue.amenities, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'venue_id' })
    venue: Venue;
}
