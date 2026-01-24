import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { FraudType, FraudRiskLevel, FraudStatus } from '../../../common/constants/ai.constant';
import { User } from '../../users/entities/user.entity';
import { Booking } from '../../bookings/entities/booking.entity';

@Entity('ai_fraud_detections')
export class AIFraudDetection extends BaseEntity {
    @Column({ name: 'user_id', nullable: true })
    @Index()
    userId: string;

    @Column({ name: 'booking_id', nullable: true })
    @Index()
    bookingId: string;

    @Column({ name: 'payment_id', nullable: true })
    @Index()
    paymentId: string;

    @Column({ name: 'review_id', nullable: true })
    @Index()
    reviewId: string;

    @Column({
        name: 'fraud_type',
        type: 'enum',
        enum: FraudType,
    })
    fraudType: FraudType;

    @Column({
        name: 'risk_level',
        type: 'enum',
        enum: FraudRiskLevel,
    })
    riskLevel: FraudRiskLevel;

    @Column({ name: 'risk_score', type: 'float' })
    riskScore: number;

    @Column({ name: 'detected_by' })
    detectedBy: 'AI_MODEL' | 'MANUAL' | 'SYSTEM_RULE';

    @Column({ name: 'model_used', nullable: true })
    modelUsed: string;

    @Column({ type: 'jsonb', nullable: true })
    signals: Record<string, any>;

    @Column({ type: 'simple-array', nullable: true })
    evidence: string[];

    @Column({
        type: 'enum',
        enum: FraudStatus,
        default: FraudStatus.FLAGGED,
    })
    status: FraudStatus;

    @Column({ name: 'reviewed_by', nullable: true })
    reviewedBy: string;

    @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
    reviewedAt: Date;

    @Column({ name: 'review_notes', type: 'text', nullable: true })
    reviewNotes: string;

    @Column({ name: 'actions_taken', type: 'jsonb', nullable: true })
    actionsTaken: any;

    @Column({ name: 'detected_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    detectedAt: Date;

    @Column({ name: 'resolved_at', type: 'timestamp', nullable: true })
    resolvedAt: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Booking, { nullable: true })
    @JoinColumn({ name: 'booking_id' })
    booking: Booking;
}
