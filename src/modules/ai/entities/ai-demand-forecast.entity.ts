import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Venue } from '../../venues/entities/venue.entity';
import { Court } from 'src/modules/courts/entities/court.entity';

@Entity('ai_demand_forecasts')
@Unique(['venueId', 'courtId', 'forecastDate', 'forecastHour'])
export class AIDemandForecast extends BaseEntity {
    @Column({ name: 'venue_id' })
    venueId: string;

    @Column({ name: 'court_id', nullable: true })
    courtId: string;

    @Column({ name: 'forecast_date', type: 'date' })
    forecastDate: string;

    @Column({ name: 'forecast_hour', type: 'int' })
    forecastHour: number;

    @Column({ name: 'predicted_bookings', type: 'int', nullable: true })
    predictedBookings: number;

    @Column({ name: 'predicted_revenue', type: 'decimal', precision: 10, scale: 2, nullable: true })
    predictedRevenue: number;

    @Column({ name: 'predicted_occupancy_rate', type: 'decimal', precision: 3, scale: 2, nullable: true })
    predictedOccupancyRate: number;

    @Column({ name: 'lower_bound', type: 'int', nullable: true })
    lowerBound: number;

    @Column({ name: 'upper_bound', type: 'int', nullable: true })
    upperBound: number;

    @Column({ name: 'confidence_level', type: 'decimal', precision: 3, scale: 2, nullable: true })
    confidenceLevel: number;

    @Column({ name: 'weather_forecast', type: 'jsonb', nullable: true })
    weatherForecast: Record<string, any>;

    @Column({ name: 'is_weekend', nullable: true })
    isWeekend: boolean;

    @Column({ name: 'is_holiday', nullable: true })
    isHoliday: boolean;

    @Column({ name: 'nearby_events', type: 'jsonb', nullable: true })
    nearbyEvents: any[];

    @Column({ name: 'historical_patterns', type: 'jsonb', nullable: true })
    historicalPatterns: any[];

    @Column({ name: 'actual_bookings', type: 'int', nullable: true })
    actualBookings: number;

    @Column({ name: 'actual_revenue', type: 'decimal', precision: 10, scale: 2, nullable: true })
    actualRevenue: number;

    @Column({ name: 'forecast_accuracy', type: 'decimal', precision: 3, scale: 2, nullable: true })
    forecastAccuracy: number;

    @Column({ name: 'model_version', nullable: true })
    modelVersion: string;

    @ManyToOne(() => Venue, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'venue_id' })
    venue: Venue;

    @ManyToOne(() => Court, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'court_id' })
    court: Court;
}
