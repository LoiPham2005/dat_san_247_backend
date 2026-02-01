import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Organization } from './organization.entity';
import { Venue } from './venue.entity';
import { RefundRule } from './refund-rule.entity';

@Entity('refund_policies')
export class RefundPolicy extends BaseEntity {
    @Column({ name: 'organization_id', type: 'uuid', nullable: true })
    organizationId: string;

    @Column({ name: 'venue_id', type: 'uuid', nullable: true })
    venueId: string;

    @Column()
    name: string; // e.g., "Flexible", "Strict", "No Refund"

    @Column({ type: 'text', nullable: true })
    description: string;

    @OneToMany(() => RefundRule, (rule) => rule.policy)
    rules: RefundRule[];

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @ManyToOne(() => Organization, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'organization_id' })
    organization: Organization;

    @ManyToOne(() => Venue, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'venue_id' })
    venue: Venue;
}
