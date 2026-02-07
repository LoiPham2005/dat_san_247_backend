import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    Index,
    Unique,
    Relation,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Court } from '../../courts/entities/court.entity';
import { TimeSlotStatus } from '../../../common/constants/time-slot-status.constant';

@Entity('time_slots')
@Unique(['courtId', 'date', 'startTime', 'endTime'])
export class TimeSlot extends BaseEntity {
    @Column({ name: 'court_id' })
    @Index()
    courtId: string;

    @Column({ type: 'date' })
    @Index()
    date: Date;

    @Column({ name: 'start_time', type: 'time' })
    startTime: string;

    @Column({ name: 'end_time', type: 'time' })
    endTime: string;

    @Column({
        type: 'enum',
        enum: TimeSlotStatus,
        default: TimeSlotStatus.AVAILABLE,
    })
    @Index()
    status: TimeSlotStatus;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @ManyToOne(() => Court, (court) => court.timeSlots, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'court_id' })
    court: Relation<Court>;
}
