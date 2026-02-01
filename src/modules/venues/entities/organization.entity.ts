import { Entity, Column, OneToMany, JoinColumn, ManyToOne, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Venue } from '../../venues/entities/venue.entity';

@Entity('organizations')
export class Organization extends BaseEntity {
    @Column({ unique: true })
    name: string; // e.g., "Dai Viet Sports Group"

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ name: 'logo_url', type: 'text', nullable: true })
    logoUrl: string;

    @Column({ name: 'website_url', type: 'text', nullable: true })
    websiteUrl: string;

    @Column({ name: 'owner_id', type: 'uuid' })
    @Index()
    ownerId: string;

    @Column({ name: 'tax_code', nullable: true })
    taxCode: string;

    @Column({ name: 'address', type: 'text', nullable: true })
    address: string;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'owner_id' })
    owner: User;

    @OneToMany(() => Venue, (venue) => venue.organization)
    venues: Venue[];
}
