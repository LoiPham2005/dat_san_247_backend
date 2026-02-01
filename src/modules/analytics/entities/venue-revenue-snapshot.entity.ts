import { Entity, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Venue } from '../../venues/entities/venue.entity';

@Entity('venue_revenue_snapshots')
@Unique(['venueId', 'snapshotDate'])
export class VenueRevenueSnapshot extends BaseEntity {
    @Column({ name: 'venue_id', type: 'uuid' })
    @Index()
    venueId: string;

    @Column({ name: 'snapshot_date', type: 'date' })
    @Index()
    snapshotDate: Date;

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    totalRevenue: number;

    @Column({ type: 'int', default: 0 })
    totalBookings: number;

    @Column({ type: 'int', default: 0 })
    cancelledBookings: number;

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, comment: 'Revenue from services/add-ons' })
    serviceRevenue: number;

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, comment: 'Net profit after platform commissions' })
    netProfit: number;

    @Column({ type: 'jsonb', nullable: true, comment: 'Detailed stats: { "popular_hours": [...], "top_court_id": "uuid" }' })
    metadata: any;

    @ManyToOne(() => Venue, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'venue_id' })
    venue: Venue;
}
