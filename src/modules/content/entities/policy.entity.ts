import { Entity, Column, ManyToOne, JoinColumn, OneToOne, Relation } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Content } from './content.entity';
import { PolicyType } from '../../../common/constants/content.constant';

@Entity('policies')
export class Policy extends BaseEntity {
    @Column({ name: 'content_id' })
    contentId: string;

    @Column({
        type: 'enum',
        enum: PolicyType,
    })
    policyType: PolicyType;

    @Column()
    version: string; // "1.0.0"

    @Column({ name: 'effective_date', type: 'timestamp' })
    effectiveDate: Date;

    @Column({ name: 'previous_version_id', nullable: true })
    previousVersionId: string;

    @Column({ name: 'requires_acceptance', default: false })
    requiresAcceptance: boolean;

    @Column({ name: 'accepted_count', default: 0 })
    acceptedCount: number;

    @Column({ name: 'legal_reviewed', default: false })
    legalReviewed: boolean;

    @Column({ name: 'legal_reviewed_by', nullable: true })
    legalReviewedBy: string;

    @Column({ name: 'legal_reviewed_at', type: 'timestamp', nullable: true })
    legalReviewedAt: Date;

    @ApiProperty({ type: () => Content })
    @OneToOne(() => Content, (content) => content.policy)
    @JoinColumn({ name: 'content_id' })
    content: Relation<Content>;
}
