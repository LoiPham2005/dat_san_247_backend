import { Entity, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Venue } from './venue.entity';
import { DayOfWeek } from '../../../common/constants/day-of-week.constant';

@Entity('venue_operating_hours')
@Unique(['venueId', 'dayOfWeek'])
export class VenueOperatingHour extends BaseEntity {
    @Column({ name: 'venue_id', type: 'uuid' })
    @Index()
    venueId: string;

    @Column({
        type: 'enum',
        enum: DayOfWeek
    })
    dayOfWeek: DayOfWeek;

    @Column({ name: 'opening_time', type: 'time' })
    openingTime: string;

    @Column({ name: 'closing_time', type: 'time' })
    closingTime: string;

    @Column({ name: 'is_closed', default: false, comment: 'Whether the venue is closed on this day' })
    isClosed: boolean;

    @ManyToOne(() => Venue, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'venue_id' })
    venue: Venue;
}
