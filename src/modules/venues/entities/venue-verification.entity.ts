import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Venue } from './venue.entity';
import { User } from '../../users/entities/user.entity';

export enum VerificationStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

@Entity('venue_verifications')
export class VenueVerification extends BaseEntity {
    @Column({ name: 'venue_id', type: 'uuid' })
    @Index()
    venueId: string;

    @Column({ name: 'business_license_url', type: 'text' })
    businessLicenseUrl: string;

    @Column({ name: 'identity_card_front_url', type: 'text' })
    identityCardFrontUrl: string;

    @Column({ name: 'identity_card_back_url', type: 'text' })
    identityCardBackUrl: string;

    @Column({ name: 'owner_photo_url', type: 'text' })
    ownerPhotoUrl: string;

    @Column({
        type: 'enum',
        enum: VerificationStatus,
        default: VerificationStatus.PENDING
    })
    @Index()
    status: VerificationStatus;

    @Column({ name: 'verified_at', type: 'timestamp', nullable: true })
    verifiedAt: Date;

    @Column({ name: 'verified_by', type: 'uuid', nullable: true })
    verifiedById: string;

    @Column({ name: 'rejection_reason', type: 'text', nullable: true })
    rejectionReason: string;

    @ManyToOne(() => Venue, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'venue_id' })
    venue: Venue;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'verified_by' })
    verifiedBy: User;
}
