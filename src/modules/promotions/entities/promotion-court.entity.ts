import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    Unique,
    Relation,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Promotion } from './promotion.entity';
import { Court } from '../../courts/entities/court.entity';

@Entity('promotion_courts')
@Unique(['promotionId', 'courtId'])
export class PromotionCourt extends BaseEntity {
    @Column({ name: 'promotion_id' })
    promotionId: string;

    @Column({ name: 'court_id' })
    courtId: string;

    @ManyToOne(() => Promotion, (promotion) => promotion.courts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'promotion_id' })
    promotion: Relation<Promotion>;

    @ManyToOne(() => Court)
    @JoinColumn({ name: 'court_id' })
    court: Relation<Court>;
}
