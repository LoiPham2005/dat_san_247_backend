import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { ForecastGranularity } from '../../../common/constants/ai.constant';
import { Venue } from '../../venues/entities/venue.entity';

@Entity('ai_demand_forecasts')
export class AIDemandForecast extends BaseEntity {
    @Column({ name: 'venue_id' })
    @Index()
    venueId: string;

    @Column({ name: 'forecast_date', type: 'timestamp' })
    forecastDate: Date;

    @Column({
        type: 'enum',
        enum: ForecastGranularity,
    })
    granularity: ForecastGranularity;

    @Column({ name: 'predicted_bookings', type: 'float' })
    predictedBookings: number;

    @Column({ name: 'predicted_revenue', type: 'decimal', precision: 15, scale: 2 })
    predictedRevenue: number;

    @Column({ name: 'predicted_occupancy', type: 'float' })
    predictedOccupancy: number;

    @Column({ name: 'bookings_lower_bound', type: 'float' })
    bookingsLowerBound: number;

    @Column({ name: 'bookings_upper_bound', type: 'float' })
    bookingsUpperBound: number;

    @Column({ type: 'float' })
    confidence: number;

    @Column({ type: 'jsonb' })
    features: any;

    @Column({ name: 'model_used' })
    modelUsed: string;

    @Column({ name: 'model_version' })
    modelVersion: string;

    @Column({ name: 'model_accuracy', type: 'float', nullable: true })
    modelAccuracy: number;

    @Column({ name: 'actual_bookings', type: 'float', nullable: true })
    actualBookings: number;

    @Column({ name: 'actual_revenue', type: 'decimal', precision: 15, scale: 2, nullable: true })
    actualRevenue: number;

    @Column({ name: 'forecast_error', type: 'float', nullable: true })
    forecastError: number;

    @ManyToOne(() => Venue)
    @JoinColumn({ name: 'venue_id' })
    venue: Venue;
}
