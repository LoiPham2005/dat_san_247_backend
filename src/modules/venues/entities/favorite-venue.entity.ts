import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    Unique,
    Relation,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Venue } from './venue.entity';

@Entity('favorite_venues')
@Unique(['userId', 'venueId'])
export class FavoriteVenue extends BaseEntity {
    @Column({ name: 'user_id' })
    userId: string;

    @Column({ name: 'venue_id' })
    venueId: string;

    @ManyToOne(() => User, (user) => user.favoriteVenues, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: Relation<User>;

    @ManyToOne(() => Venue, (venue) => venue.favoritedBy, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'venue_id' })
    venue: Relation<Venue>;
}
