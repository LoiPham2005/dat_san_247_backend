import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Court } from '../../courts/entities/court.entity';

@Entity('court_maintenance')
export class CourtMaintenance extends BaseEntity {
    @Column({ name: 'court_id', type: 'uuid' })
    @Index()
    courtId: string;

    @Column({ name: 'start_date', type: 'timestamp' })
    startDate: Date;

    @Column({ name: 'end_date', type: 'timestamp' })
    endDate: Date;

    @Column({ type: 'text' })
    reason: string;

    @Column({ name: 'is_emergency', default: false })
    isEmergency: boolean;

    @ManyToOne(() => Court, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'court_id' })
    court: Court;
}
