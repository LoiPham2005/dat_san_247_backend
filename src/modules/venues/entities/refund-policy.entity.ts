import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Organization } from './organization.entity';
import { Venue } from './venue.entity';

@Entity('refund_policies')
export class RefundPolicy extends BaseEntity {
    @Column({ name: 'organization_id', type: 'uuid', nullable: true })
    organizationId: string;

    @Column({ name: 'venue_id', type: 'uuid', nullable: true })
    venueId: string;

    @Column()
    name: string; // e.g., "Flexible", "Strict", "No Refund"

    @Column({ name: 'cancel_before_hours', type: 'int' })
    cancelBeforeHours: number; // e.g., 24 hours

    @Column({ name: 'refund_percentage', type: 'decimal', precision: 5, scale: 2 })
    refundPercentage: number; // e.g., 100.00 or 50.00

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @ManyToOne(() => Organization, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'organization_id' })
    organization: Organization;

    @ManyToOne(() => Venue, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'venue_id' })
    venue: Venue;
}
