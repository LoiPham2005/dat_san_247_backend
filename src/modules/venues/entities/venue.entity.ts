import {
    Entity,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    Index,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { VenueStatus } from '../../../common/constants/venue-status.constant';
import { VenueImage } from './venue-image.entity';
import { VenueOperatingHour } from './venue-operating-hour.entity';
import { Court } from '../../courts/entities/court.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { Review } from '../../reviews/entities/review.entity';
import { FavoriteVenue } from './favorite-venue.entity';
import { Organization } from './organization.entity';

@Entity('venues')
export class Venue extends BaseEntity {
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'owner_id' })
    owner: User;

    @Column({ name: 'owner_id' })
    @Index()
    ownerId: string;

    @Column({ name: 'organization_id', type: 'uuid', nullable: true })
    @Index()
    organizationId: string;

    @ManyToOne(() => Organization, (org) => org.venues, { nullable: true })
    @JoinColumn({ name: 'organization_id' })
    organization: Organization;

    @Column()
    name: string;

    @Column({ unique: true })
    @Index()
    slug: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'text' })
    address: string;

    @Column()
    @Index()
    city: string;

    @Column()
    @Index()
    district: string;

    @Column({ nullable: true })
    ward: string;

    @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
    latitude: number;

    @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
    longitude: number;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    email: string;

    @Column({ type: 'enum', enum: VenueStatus, default: VenueStatus.PENDING })
    @Index()
    status: VenueStatus;

    @Column({ name: 'rejection_reason', type: 'text', nullable: true })
    rejectionReason: string;

    @Column({ name: 'thumbnail_url', type: 'text', nullable: true })
    thumbnailUrl: string;

    @Column({ name: 'opening_time', type: 'time', default: '06:00:00' })
    openingTime: string;

    @Column({ name: 'closing_time', type: 'time', default: '23:00:00' })
    closingTime: string;

    @Column({ name: 'rating', type: 'decimal', precision: 3, scale: 2, default: 0, comment: 'Overall average rating' })
    rating: number;

    @Column({ name: 'total_reviews', default: 0, comment: 'Total number of reviews' })
    totalReviews: number;

    @Column({ name: 'is_featured', default: false })
    @Index()
    isFeatured: boolean;

    @Column({ name: 'featured_until', type: 'timestamp', nullable: true })
    featuredUntil: Date;

    @Column({ name: 'commission_rate', type: 'decimal', precision: 5, scale: 2, default: 0, comment: 'Percentage taken by platform' })
    commissionRate: number;

    @Column({ name: 'rating_cleanliness', type: 'decimal', precision: 3, scale: 2, default: 0 })
    cleanlinessRating: number;

    @Column({ name: 'rating_facilities', type: 'decimal', precision: 3, scale: 2, default: 0 })
    facilitiesRating: number;

    @Column({ name: 'rating_staff', type: 'decimal', precision: 3, scale: 2, default: 0 })
    staffRating: number;


    @Column({ name: 'search_keywords', type: 'jsonb', nullable: true, comment: 'Tags and keywords for fast search' })
    searchKeywords: string[];

    @Column({ name: 'vat_rate', type: 'decimal', precision: 5, scale: 2, default: 0, comment: 'VAT percentage if applicable' })
    vatRate: number;

    @Column({ name: 'business_type', nullable: true, comment: 'e.g., "INDIVIDUAL", "COMPANY"' })
    businessType: string;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @Column({ name: 'social_links', type: 'jsonb', nullable: true, comment: '{ "facebook": "...", "instagram": "..." }' })
    socialLinks: Record<string, string>;

    @Column({ name: 'auto_accept_bookings', default: true, comment: 'If false, staff must manually confirm bookings' })
    autoAcceptBookings: boolean;

    @Column({ name: 'min_booking_before_hours', default: 0, comment: 'Minimum time before start to allow bookings' })
    minBookingBeforeHours: number;

    @Column({ name: 'cancellation_before_hours', default: 24, comment: 'Default cancellation window if not specified in policy' })
    cancellationBeforeHours: number;

    @OneToMany(() => VenueImage, (image) => image.venue)
    images: VenueImage[];

    @Column({ type: 'jsonb', nullable: true, comment: 'Amenities like {name: "Wifi", icon: "wifi"}' })
    amenities: { name: string, icon?: string }[];

    @OneToMany(() => VenueOperatingHour, (oh) => oh.venue)
    operatingHours: VenueOperatingHour[];

    @OneToMany(() => Court, (court) => court.venue)
    courts: Court[];

    @OneToMany(() => Booking, (booking) => booking.venue)
    bookings: Booking[];

    @OneToMany(() => Review, (review) => review.venue)
    reviews: Review[];

    @OneToMany(() => FavoriteVenue, (fv) => fv.venue)
    favoritedBy: FavoriteVenue[];
}
