import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Venue } from '../../venues/entities/venue.entity';

import { TournamentStatus, TournamentFormat } from '../../../common/constants/social.constant';



@Entity('tournaments')
export class Tournament extends BaseEntity {
    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ name: 'sport_type' })
    @Index()
    sportType: string;

    @Column({
        type: 'enum',
        enum: TournamentFormat,
        default: TournamentFormat.SINGLE_ELIMINATION
    })
    format: TournamentFormat;

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

    @Column({ name: 'prize_structure', type: 'jsonb', nullable: true, comment: '{ "1st": "10M", "2nd": "5M" }' })
    prizeStructure: any;

    @Column({ name: 'registration_deadline', type: 'timestamp', nullable: true })
    registrationDeadline: Date;

    @Column({ type: 'text', nullable: true, comment: 'Tournament rules and regulations' })
    rules: string;

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
