import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Venue } from '../../venues/entities/venue.entity';

@Entity('venue_services')
export class VenueService extends BaseEntity {
    @Column({ name: 'venue_id', type: 'uuid' })
    @Index()
    venueId: string;

    @Column()
    name: string; // e.g., "Water Bottle", "Boots Rental", "Referee Support"

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'decimal', precision: 15, scale: 2 })
    price: number;

    @Column({ name: 'unit', default: 'unit' })
    unit: string; // e.g., "bottle", "pair", "match"

    @Column({ name: 'is_available', default: true })
    isAvailable: boolean;

    @Column({ name: 'track_inventory', default: false })
    trackInventory: boolean;

    @Column({ name: 'stock_quantity', type: 'int', default: 0 })
    stockQuantity: number;

    @Column({ name: 'category', nullable: true })
    category: string; // e.g., "FOOD_DRINK", "EQUIPMENT", "PERSONNEL"

    @ManyToOne(() => Venue, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'venue_id' })
    venue: Venue;
}
