import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { MatchFinding } from './match-finding.entity';

@Entity('match_applications')
@Unique(['matchFindingId', 'applicantType', 'applicantId'])
export class MatchApplication extends BaseEntity {
    @Column({ name: 'match_finding_id', type: 'uuid' })
    matchFindingId: string;

    @Column({ name: 'applicant_type', length: 20 })
    applicantType: string;

    @Column({ name: 'applicant_id', type: 'uuid' })
    applicantId: string;

    @Column({ type: 'text', nullable: true })
    message: string;

    @Column({ length: 20, default: 'PENDING' })
    status: string;

    @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
    reviewedAt: Date;

    @ManyToOne(() => MatchFinding, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'match_finding_id' })
    matchFinding: MatchFinding;
}
