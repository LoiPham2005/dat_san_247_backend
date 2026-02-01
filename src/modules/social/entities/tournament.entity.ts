import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Venue } from '../../venues/entities/venue.entity';

export enum TournamentStatus {
    PLANNING = 'PLANNING',
    REGISTRATION_OPEN = 'REGISTRATION_OPEN',
    REGISTRATION_CLOSED = 'REGISTRATION_CLOSED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

@Entity('tournaments')
export class Tournament extends BaseEntity {
    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ name: 'sport_type' })
    @Index()
    sportType: string;

    @Column({ name: 'start_date', type: 'date' })
    startDate: Date;

    @Column({ name: 'end_date', type: 'date' })
    endDate: Date;

    @Column({ name: 'venue_id', type: 'uuid' })
    @Index()
    venueId: string;

    @Column({ name: 'max_teams', default: 16 })
    maxTeams: number;

    @Column({ name: 'entry_fee', type: 'decimal', precision: 15, scale: 2, default: 0 })
    entryFee: number;

    @Column({ name: 'prize_pool', type: 'text', nullable: true })
    prizePool: string;

    @Column({
        type: 'enum',
        enum: TournamentStatus,
        default: TournamentStatus.PLANNING,
    })
    status: TournamentStatus;

    @Column({ name: 'created_by', type: 'uuid' })
    createdById: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by' })
    createdBy: User;

    @ManyToOne(() => Venue)
    @JoinColumn({ name: 'venue_id' })
    venue: Venue;
}
