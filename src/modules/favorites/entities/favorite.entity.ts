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
import { User } from 'src/modules/auth/entities/user.entity';

@Entity('favorites')
@Unique('unique_favorite', ['userId', 'venueId'])
export class Favorite {
  @PrimaryGeneratedColumn({ name: 'favorite_id' })
  favoriteId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'venue_id' })
  venueId: number;

  @ManyToOne(() => Venue, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
