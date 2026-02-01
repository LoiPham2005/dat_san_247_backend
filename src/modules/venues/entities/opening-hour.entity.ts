import { Entity, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Venue } from './venue.entity';

@Entity('venue_opening_hours')
@Unique(['venueId', 'dayOfWeek'])
export class VenueOpeningHour extends BaseEntity {
    @Column({ name: 'venue_id', type: 'uuid' })
    @Index()
    venueId: string;

    @Column({ name: 'day_of_week', type: 'int', comment: '0 (Sunday) to 6 (Saturday)' })
    dayOfWeek: number;

    @Column({ name: 'opening_time', type: 'time', default: '06:00:00' })
    openingTime: string;

    @Column({ name: 'closing_time', type: 'time', default: '22:00:00' })
    closingTime: string;

    @Column({ name: 'is_closed', default: false })
    isClosed: boolean;

    @ManyToOne(() => Venue, (venue) => venue.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'venue_id' })
    venue: Venue;
}
