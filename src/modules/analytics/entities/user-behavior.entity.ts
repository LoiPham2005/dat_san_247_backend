import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Venue } from '../../venues/entities/venue.entity';
import { Court } from '../../courts/entities/court.entity';

export enum UserActionType {
    VIEW_VENUE = 'VIEW_VENUE',
    SEARCH = 'SEARCH',
    BOOK = 'BOOK',
    FAVORITE = 'FAVORITE',
    UNFAVORITE = 'UNFAVORITE',
    REVIEW = 'REVIEW',
    SHARE = 'SHARE',
    CLICK_PROMOTION = 'CLICK_PROMOTION',
    FILTER_CHANGE = 'FILTER_CHANGE',
    SORT_CHANGE = 'SORT_CHANGE',
    VIEW_COURT = 'VIEW_COURT',
    ADD_TO_CART = 'ADD_TO_CART',
    REMOVE_FROM_CART = 'REMOVE_FROM_CART',
    CHECKOUT_START = 'CHECKOUT_START',
    PAYMENT_COMPLETE = 'PAYMENT_COMPLETE',
    CANCEL_BOOKING = 'CANCEL_BOOKING',
}

@Entity('user_behaviors')
export class UserBehavior extends BaseEntity {
    @Column({ name: 'user_id', type: 'uuid', nullable: true })
    @Index()
    userId: string;

    @Column({
        name: 'action_type',
        type: 'enum',
        enum: UserActionType,
    })
    @Index()
    actionType: UserActionType;

    @Column({ name: 'venue_id', type: 'uuid', nullable: true })
    @Index()
    venueId: string;

    @Column({ name: 'court_id', type: 'uuid', nullable: true })
    courtId: string;

    @Column({ name: 'sport_type', nullable: true })
    sportType: string;

    @Column({ type: 'jsonb', nullable: true, comment: 'Additional data: search_query, filters, time_spent_seconds, etc.' })
    metadata: {
        searchQuery?: string;
        filters?: Record<string, any>;
        timeSpentSeconds?: number;
        referrer?: string;
        deviceType?: string;
        location?: { city: string; district: string };
        priceRange?: { min: number; max: number };
        clickPosition?: number;
        scrollDepth?: number;
    };

    @Column({ name: 'session_id', nullable: true })
    @Index()
    sessionId: string;

    @Column({ name: 'ip_address', nullable: true })
    ipAddress: string;

    @Column({ name: 'user_agent', type: 'text', nullable: true })
    userAgent: string;

    @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Venue, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'venue_id' })
    venue: Venue;

    @ManyToOne(() => Court, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'court_id' })
    court: Court;
}
