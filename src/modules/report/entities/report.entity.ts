import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Venue } from '../../venues/entities/venue.entity';

@Entity('reports')
export class Report {
    @PrimaryGeneratedColumn({ name: 'report_id' })
    reportId: number;

    @ManyToOne(() => User, (user) => user.reportedReports, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'reporter_id' })
    reporter: User;

    @ManyToOne(() => Venue, (venue) => venue.reports, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'reported_venue_id' })
    reportedVenue?: Venue;

    @ManyToOne(() => User, (user) => user.receivedReports, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'reported_user_id' })
    reportedUser?: User;


    @Column({
        name: 'report_type',
        type: 'enum',
        enum: ['inappropriate_content', 'fake_info', 'poor_service', 'fraud', 'spam', 'other'],
    })
    reportType: string;

    @Column({ type: 'text', nullable: false })
    description: string;

    @Column({ name: 'evidence_urls', type: 'json', nullable: true })
    evidenceUrls?: string[];

    @Column({
        type: 'enum',
        enum: ['pending', 'investigating', 'resolved', 'dismissed'],
        default: 'pending',
    })
    status: string;

    @Column({
        type: 'enum',
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium',
    })
    priority: string;

    @Column({ name: 'admin_notes', type: 'text', nullable: true })
    adminNotes?: string;

    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'resolved_by' })
    resolvedBy?: User;

    @Column({ name: 'resolved_at', type: 'timestamp', nullable: true })
    resolvedAt?: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
