import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Venue } from './venue.entity';

@Entity('venue_images')
export class VenueImage extends BaseEntity {
    @Column({ name: 'venue_id' })
    venueId: string;

    @Column({ name: 'image_url', type: 'text' })
    imageUrl: string;

    @Column({ name: 'display_order', default: 0 })
    displayOrder: number;

    @ManyToOne(() => Venue, (venue) => venue.images, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'venue_id' })
    venue: Venue;
}
