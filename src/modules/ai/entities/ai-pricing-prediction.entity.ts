import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Court } from 'src/modules/courts/entities/court.entity';

@Entity('ai_pricing_predictions')
@Unique(['courtId', 'date', 'timeSlot'])
export class AIPricingPrediction extends BaseEntity {
    @Column({ name: 'court_id' })
    courtId: string;

    @Column({ type: 'date' })
    date: string;

    @Column({ name: 'time_slot' })
    timeSlot: string;

    @Column({ name: 'base_price', type: 'decimal', precision: 10, scale: 2 })
    basePrice: number;

    @Column({ name: 'predicted_price', type: 'decimal', precision: 10, scale: 2 })
    predictedPrice: number;

    @Column({ name: 'demand_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
    demandScore: number;

    @Column({ name: 'weather_factor', type: 'decimal', precision: 3, scale: 2, nullable: true })
    weatherFactor: number;

    @Column({ name: 'event_factor', type: 'decimal', precision: 3, scale: 2, nullable: true })
    eventFactor: number;

    @Column({ name: 'competition_factor', type: 'decimal', precision: 3, scale: 2, nullable: true })
    competitionFactor: number;

    @Column({ name: 'historical_booking_rate', type: 'decimal', precision: 3, scale: 2, nullable: true })
    historicalBookingRate: number;

    @Column({ type: 'jsonb', nullable: true })
    features: Record<string, any>;

    @Column({ name: 'model_version', nullable: true })
    modelVersion: string;

    @Column({ name: 'prediction_confidence', type: 'decimal', precision: 3, scale: 2, nullable: true })
    predictionConfidence: number;

    @Column({ name: 'actual_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
    actualPrice: number;

    @Column({ name: 'actual_booking_rate', type: 'decimal', precision: 3, scale: 2, nullable: true })
    actualBookingRate: number;

    @ManyToOne(() => Court, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'court_id' })
    court: Court;
}
