import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('user_preferences_ai')
export class UserPreferencesAI extends BaseEntity {
    @Column({ name: 'user_id', unique: true })
    userId: string;

    @Column({ name: 'preferred_sports', type: 'jsonb', nullable: true })
    preferredSports: any[];

    @Column({ name: 'preferred_locations', type: 'jsonb', nullable: true })
    preferredLocations: any[];

    @Column({ name: 'preferred_price_range', type: 'jsonb', nullable: true })
    preferredPriceRange: Record<string, any>;

    @Column({ name: 'preferred_time_slots', type: 'jsonb', nullable: true })
    preferredTimeSlots: any[];

    @Column({ name: 'preferred_amenities', type: 'jsonb', nullable: true })
    preferredAmenities: string[];

    @Column({ name: 'booking_frequency', nullable: true })
    bookingFrequency: string;

    @Column({ name: 'avg_booking_value', type: 'decimal', precision: 10, scale: 2, nullable: true })
    avgBookingValue: number;

    @Column({ name: 'last_updated', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    lastUpdated: Date;

    @Column({ name: 'confidence_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
    confidenceScore: number;

    @OneToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
}
