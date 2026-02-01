import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Booking } from '../../bookings/entities/booking.entity';

@Entity('ai_cancellation_predictions')
export class AICancellationPrediction extends BaseEntity {
    @Column({ name: 'booking_id', unique: true })
    bookingId: string;

    @Column({ name: 'cancellation_probability', type: 'decimal', precision: 3, scale: 2, nullable: true })
    cancellationProbability: number;

    @Column({ name: 'risk_level', nullable: true })
    riskLevel: string;

    @Column({ name: 'user_cancellation_history', type: 'int', nullable: true })
    userCancellationHistory: number;

    @Column({ name: 'booking_advance_days', type: 'int', nullable: true })
    bookingAdvanceDays: number;

    @Column({ name: 'weather_forecast', type: 'jsonb', nullable: true })
    weatherForecast: Record<string, any>;

    @Column({ name: 'price_vs_average', type: 'decimal', precision: 3, scale: 2, nullable: true })
    priceVsAverage: number;

    @Column({ name: 'user_behavior_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
    userBehaviorScore: number;

    @Column({ name: 'should_overbooking', nullable: true })
    shouldOverbooking: boolean;

    @Column({ name: 'recommended_waitlist_size', type: 'int', nullable: true })
    recommendedWaitlistSize: number;

    @Column({ name: 'was_cancelled', nullable: true })
    wasCancelled: boolean;

    @Column({ name: 'prediction_accuracy', type: 'decimal', precision: 3, scale: 2, nullable: true })
    predictionAccuracy: number;

    @Column({ name: 'model_version', nullable: true })
    modelVersion: string;

    @OneToOne(() => Booking, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'booking_id' })
    booking: Booking;
}
