import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Venue } from './venue.entity';

@Entity('venue_schedule_exceptions')
export class VenueScheduleException extends BaseEntity {
    @Column({ name: 'venue_id', type: 'uuid' })
    @Index()
    venueId: string;

    @Column({ name: 'start_date', type: 'timestamp' })
    @Index()
    startDate: Date;

    @Column({ name: 'end_date', type: 'timestamp' })
    @Index()
    endDate: Date;

    @Column({ name: 'reason', type: 'text', nullable: true })
    reason: string; // e.g., "Maintenance", "Lunar New Year Holiday"

    @Column({ name: 'is_closed', default: true, comment: 'If true, courts are fully blocked' })
    isClosed: boolean;

    @ManyToOne(() => Venue, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'venue_id' })
    venue: Venue;
}
