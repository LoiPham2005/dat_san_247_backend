import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    Unique,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Promotion } from './promotion.entity';
import { Venue } from '../../venues/entities/venue.entity';

@Entity('promotion_venues')
@Unique(['promotionId', 'venueId'])
export class PromotionVenue extends BaseEntity {
    @Column({ name: 'promotion_id' })
    promotionId: string;

    @Column({ name: 'venue_id' })
    venueId: string;

    @ManyToOne(() => Promotion, (promotion) => promotion.venues, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'promotion_id' })
    promotion: Promotion;

    @ManyToOne(() => Venue)
    @JoinColumn({ name: 'venue_id' })
    venue: Venue;
}
