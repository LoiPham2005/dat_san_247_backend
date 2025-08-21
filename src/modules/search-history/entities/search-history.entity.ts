import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Venue } from '../../venues/entities/venue.entity';

@Entity('search_history')
export class SearchHistory {
  @PrimaryGeneratedColumn({ name: 'search_id' })
  searchId: number;

  @Column({ type: 'int', nullable: true, name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 255, name: 'search_query' })
  searchQuery: string;

  @Column({ type: 'json', nullable: true, name: 'search_filters' })
  searchFilters: any;

  @Column({ type: 'int', default: 0, name: 'results_count' })
  resultsCount: number;

  @Column({ type: 'int', nullable: true, name: 'clicked_venue_id' })
  clickedVenueId: number;

  @ManyToOne(() => Venue, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'clicked_venue_id' })
  clickedVenue: Venue;

  @Column({ length: 255, nullable: true, name: 'session_id' })
  sessionId: string;

  @Column({ length: 45, nullable: true, name: 'ip_address' })
  ipAddress: string;

  @Column({ type: 'date', name: 'search_date' })
  searchDate: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
