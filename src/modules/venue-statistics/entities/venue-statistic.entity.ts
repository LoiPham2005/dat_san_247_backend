import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Venue } from '../../venues/entities/venue.entity';

@Entity('venue_statistics')
@Unique('unique_venue_date', ['venueId', 'date'])
export class VenueStatistic {
  @PrimaryGeneratedColumn({ name: 'stat_id' })
  statId: number;

  @Column({ type: 'int', name: 'venue_id' })
  venueId: number;

  @ManyToOne(() => Venue, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'int', default: 0, name: 'total_views' })
  totalViews: number;

  @Column({ type: 'int', default: 0, name: 'total_bookings' })
  totalBookings: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'total_revenue' })
  totalRevenue: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'commission_earned' })
  commissionEarned: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0, name: 'average_rating' })
  averageRating: number;

  @Column({ type: 'int', default: 0, name: 'total_favorites' })
  totalFavorites: number;

  @Column({ type: 'int', default: 0, name: 'total_messages' })
  totalMessages: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, name: 'cancellation_rate' })
  cancellationRate: number;

  @Column({ type: 'int', default: 0, name: 'response_time_avg' })
  responseTimeAvg: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
