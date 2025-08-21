import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { SportCategory } from '../../sport-categories/entities/sport-category.entity';
import { User } from 'src/modules/auth/entities/user.entity';
import { VenueImage } from 'src/modules/venue-images/entities/venue-image.entity';
import { VenuePricing } from 'src/modules/venue-pricing/entities/venue-pricing.entity';
import { VenueOperatingHour } from 'src/modules/venue-operating-hours/entities/venue-operating-hour.entity';
import { Booking } from 'src/modules/bookings/entities/booking.entity';
import { Review } from 'src/modules/reviews/entities/review.entity';
import { Report } from 'src/modules/report/entities/report.entity';

export enum VenueStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    INACTIVE = 'inactive',
}

@Entity('venues')
export class Venue {
    @PrimaryGeneratedColumn({ name: 'venue_id' })
    venueId: number;

    @Column({ name: 'owner_id' })
    ownerId: number;

    @ManyToOne(() => User, (user) => user.venues)
    @JoinColumn({ name: 'owner_id' })
    owner: User;

    @Column({ name: 'venue_name', length: 255 })
    venueName: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'text' })
    address: string;

    @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
    latitude: number;

    @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
    longitude: number;

    @Column({ length: 20, nullable: true })
    phone: string;

    @Column({ length: 255, nullable: true })
    email: string;

    @Column({ name: 'category_id' })
    categoryId: number;

    @ManyToOne(() => SportCategory, (category) => category.venues)
    @JoinColumn({ name: 'category_id' })
    category: SportCategory;

    @Column({ type: 'int', nullable: true })
    capacity: number;

    @Column({ type: 'enum', enum: VenueStatus, default: VenueStatus.PENDING })
    status: VenueStatus;

    @Column({ type: 'decimal', precision: 3, scale: 2, default: 0, name: 'average_rating' })
    averageRating: number;

    @Column({ type: 'int', default: 0, name: 'total_reviews' })
    totalReviews: number;

    @Column({ type: 'int', default: 0, name: 'total_bookings' })
    totalBookings: number;

    @Column({ type: 'json', nullable: true })
    amenities: Record<string, any>[];

    @Column({ type: 'json', nullable: true, name: 'venue_rules' })
    venueRules: Record<string, any>[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;


    @OneToMany(() => VenueImage, (image) => image.venue)
    images: VenueImage[];

    @OneToMany(() => VenuePricing, (pricing) => pricing.venue)
    pricings: VenuePricing[];

    @OneToMany(() => VenueOperatingHour, (hour) => hour.venue)
    operatingHours: VenueOperatingHour[];

    @OneToMany(() => Booking, (booking) => booking.venue)
    bookings: Booking[];

    @OneToMany(() => Review, (review) => review.venue)
    reviews: Review[];

    @OneToMany(() => Report, (report) => report.reportedVenue)
    reports: Report[];

}
