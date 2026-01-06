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
import { VenueAmenity } from './venue-amenity.entity';
import { Court } from '../../courts/entities/court.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { Review } from '../../reviews/entities/review.entity';
import { FavoriteVenue } from './favorite-venue.entity';

@Entity('venues')
export class Venue extends BaseEntity {
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'owner_id' })
    owner: User;

    @Column({ name: 'owner_id' })
    @Index()
    ownerId: string;

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

    @Column({ name: 'thumbnail_url', type: 'text', nullable: true })
    thumbnailUrl: string;

    @Column({ name: 'opening_time', type: 'time', default: '06:00:00' })
    openingTime: string;

    @Column({ name: 'closing_time', type: 'time', default: '23:00:00' })
    closingTime: string;

    @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.0 })
    rating: number;

    @Column({ name: 'total_reviews', default: 0 })
    totalReviews: number;

    @Column({ name: 'is_featured', default: false })
    @Index()
    isFeatured: boolean;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @OneToMany(() => VenueImage, (image) => image.venue)
    images: VenueImage[];

    @OneToMany(() => VenueAmenity, (amenity) => amenity.venue)
    amenities: VenueAmenity[];

    @OneToMany(() => Court, (court) => court.venue)
    courts: Court[];

    @OneToMany(() => Booking, (booking) => booking.venue)
    bookings: Booking[];

    @OneToMany(() => Review, (review) => review.venue)
    reviews: Review[];

    @OneToMany(() => FavoriteVenue, (fv) => fv.venue)
    favoritedBy: FavoriteVenue[];
}
