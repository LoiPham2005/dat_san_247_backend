import { Entity, Column, ManyToOne, JoinColumn, Index, Relation } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { FraudRiskLevel, FraudActionTaken } from '../../../common/constants/ai.constant';
import { User } from '../../users/entities/user.entity';
import { Booking } from '../../bookings/entities/booking.entity';

@Entity('ai_fraud_detections')
export class AIFraudDetection extends BaseEntity {
    @Column({ name: 'user_id', nullable: true })
    @Index()
    userId: string;

    @Column({ name: 'booking_id', nullable: true })
    bookingId: string;

    @Column({ name: 'payment_id', nullable: true })
    paymentId: string;

    @Column({
        name: 'risk_level',
        type: 'enum',
        enum: FraudRiskLevel,
    })
    riskLevel: FraudRiskLevel;

    @Column({ name: 'risk_score', type: 'decimal', precision: 5, scale: 4 })
    riskScore: number;

    @Column({ name: 'fraud_indicators', type: 'jsonb', nullable: true })
    fraudIndicators: Record<string, any>;

    @Column({
        name: 'action_taken',
        type: 'enum',
        enum: FraudActionTaken,
        default: FraudActionTaken.NONE,
    })
    actionTaken: FraudActionTaken;

    @Column({ name: 'is_false_positive', nullable: true })
    isFalsePositive: boolean;

    @Column({ name: 'reviewed_by', nullable: true })
    reviewedBy: string;

    @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
    reviewedAt: Date;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: Relation<User>;

    @ManyToOne(() => Booking, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'booking_id' })
    booking: Relation<Booking>;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'reviewed_by' })
    reviewer: Relation<User>;
}
