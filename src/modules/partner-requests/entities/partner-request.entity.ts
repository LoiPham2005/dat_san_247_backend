import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { Venue } from '../../venues/entities/venue.entity';
import { SportCategory } from '../../sport-categories/entities/sport-category.entity';
import { User } from 'src/modules/auth/entities/user.entity';
import { PartnerResponse } from 'src/modules/partner-responses/entities/partner-response.entity';

export enum SkillLevel {
    BEGINNER = 'beginner',
    INTERMEDIATE = 'intermediate',
    ADVANCED = 'advanced',
    PROFESSIONAL = 'professional',
}

export enum RequestStatus {
    OPEN = 'open',
    MATCHED = 'matched',
    EXPIRED = 'expired',
    CANCELLED = 'cancelled',
}

@Entity('partner_requests')
export class PartnerRequest {
    @PrimaryGeneratedColumn({ name: 'request_id' })
    requestId: number;

    @Column({ name: 'requester_id' })
    requesterId: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'requester_id' })
    requester: User;

    @Column({ name: 'venue_id' })
    venueId: number;

    @ManyToOne(() => Venue)
    @JoinColumn({ name: 'venue_id' })
    venue: Venue;

    @Column({ name: 'sport_category_id' })
    sportCategoryId: number;

    @ManyToOne(() => SportCategory)
    @JoinColumn({ name: 'sport_category_id' })
    sportCategory: SportCategory;

    @Column({ type: 'date', name: 'preferred_date' })
    preferredDate: string;

    @Column({ type: 'time', name: 'preferred_time_start' })
    preferredTimeStart: string;

    @Column({ type: 'time', name: 'preferred_time_end' })
    preferredTimeEnd: string;

    @Column({ type: 'enum', enum: SkillLevel, nullable: true })
    skillLevel: SkillLevel;

    @Column({ type: 'int', default: 1, name: 'max_players' })
    maxPlayers: number;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ length: 255, nullable: true, name: 'contact_info' })
    contactInfo: string;

    @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.OPEN })
    status: RequestStatus;

    @Column({ type: 'timestamp', name: 'expires_at' })
    expiresAt: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => PartnerResponse, (response) => response.request)
    responses: PartnerResponse[];
}
