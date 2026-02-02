import {
    Entity,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    Index,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Venue } from '../../venues/entities/venue.entity';
import { SportType } from '../../../common/constants/sport-type.constant';

import { TimeSlot } from '../../time-slots/entities/time-slot.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { PricingRule } from '../../time-slots/entities/pricing-rule.entity';
import { CourtImage } from './court-image.entity';

@Entity('courts')
export class Court extends BaseEntity {
    @Column({ name: 'venue_id' })
    @Index()
    venueId: string;

    @Column()
    name: string;

    @Column({
        name: 'sport_types',
        type: 'jsonb',
        comment: 'List of sports supported by this court. e.g., ["FOOTBALL_5", "FOOTBALL_7"]'
    })
    @Index()
    sportTypes: SportType[];

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ name: 'price_per_hour', type: 'decimal', precision: 10, scale: 2 })
    pricePerHour: number;

    @Column({ nullable: true })
    size: string;

    @Column({ name: 'is_indoor', default: false })
    isIndoor: boolean;

    @Column({ name: 'is_outdoor', default: false, comment: 'Crucial for weather integration' })
    isOutdoor: boolean;

    @Column({ name: 'surface_type', nullable: true, comment: 'e.g., Artificial Grass, Clay, Hard Court' })
    surfaceType: string;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, comment: 'Width in meters' })
    width: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, comment: 'Length in meters' })
    length: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, comment: 'Ceiling height for indoor sports' })
    height: number;

    @Column({ name: 'parent_court_id', type: 'uuid', nullable: true })
    parentCourtId: string;

    @ManyToOne(() => Court, (court) => court.subCourts, { nullable: true })
    @JoinColumn({ name: 'parent_court_id' })
    parentCourt: Court;

    @OneToMany(() => Court, (court) => court.parentCourt)
    subCourts: Court[];

    @Column({ name: 'is_active', default: true })
    @Index()
    isActive: boolean;

    @Column({ name: 'thumbnail_url', type: 'text', nullable: true })
    thumbnailUrl: string;

    @ManyToOne(() => Venue, (venue) => venue.courts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'venue_id' })
    venue: Venue;

    @OneToMany(() => CourtImage, (image) => image.court)
    images: CourtImage[];



    @OneToMany(() => TimeSlot, (slot) => slot.court)
    timeSlots: TimeSlot[];

    @OneToMany(() => Booking, (booking) => booking.court)
    bookings: Booking[];

    @OneToMany(() => PricingRule, (rule) => rule.court)
    pricingRules: PricingRule[];
}
