import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { VenueStaff } from './venue-staff.entity';
import { Venue } from './venue.entity';

@Entity('staff_shifts')
export class StaffShift extends BaseEntity {
    @Column({ name: 'staff_id', type: 'uuid' })
    @Index()
    staffId: string;

    @Column({ name: 'venue_id', type: 'uuid' })
    @Index()
    venueId: string;

    @Column({ name: 'start_at', type: 'timestamp' })
    startAt: Date;

    @Column({ name: 'end_at', type: 'timestamp' })
    endAt: Date;

    @Column({ name: 'note', type: 'text', nullable: true })
    note: string;

    @ManyToOne(() => VenueStaff, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'staff_id' })
    staff: VenueStaff;

    @ManyToOne(() => Venue, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'venue_id' })
    venue: Venue;
}
