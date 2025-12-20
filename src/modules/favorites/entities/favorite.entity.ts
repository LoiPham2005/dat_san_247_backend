// =====================================================
// 9. FAVORITE ENTITY
// =====================================================
// modules/favorites/entities/favorite.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Venue } from '../../venues/entities/venue.entity';

@Entity('favorites')
@Unique(['userId', 'venueId'])
export class Favorite extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'venue_id', type: 'uuid' })
  venueId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Venue)
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;
}