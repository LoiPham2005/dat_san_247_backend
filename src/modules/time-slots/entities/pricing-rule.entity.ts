import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Court } from '../../courts/entities/court.entity';
import { DayOfWeek } from '../../../common/constants/day-of-week.constant';

@Entity('pricing_rules')
export class PricingRule extends BaseEntity {
    @Column({ name: 'court_id' })
    courtId: string;

    @Column({
        type: 'enum',
        enum: DayOfWeek,
        nullable: true,
    })
    dayOfWeek: DayOfWeek;

    @Column({ name: 'start_time', type: 'time' })
    startTime: string;

    @Column({ name: 'end_time', type: 'time' })
    endTime: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @ManyToOne(() => Court, (court) => court.pricingRules, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'court_id' })
    court: Court;
}
