import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum AIAssistanceType {
    RECOMMENDATION = 'RECOMMENDATION',
    PREDICTION = 'PREDICTION',
    ANALYSIS = 'ANALYSIS',
    FRAUD_DETECTION = 'FRAUD_DETECTION',
    PRICING_SUGGESTION = 'PRICING_SUGGESTION'
}

@Entity('ai_assistance')
export class AIAssistance extends BaseEntity {
    @Column({ name: 'user_id', type: 'uuid', nullable: true })
    @Index()
    userId: string;

    @Column({
        type: 'enum',
        enum: AIAssistanceType,
    })
    type: AIAssistanceType;

    @Column({ name: 'target_entity', nullable: true, comment: 'e.g., Venue, Booking, User' })
    targetEntity: string;

    @Column({ name: 'target_entity_id', type: 'uuid', nullable: true })
    targetEntityId: string;

    @Column({ type: 'text' })
    title: string;

    @Column({ type: 'text', nullable: true })
    content: string;

    @Column({ type: 'jsonb', nullable: true, comment: 'Detailed AI data, logic, and metrics' })
    payload: any;

    @Column({ type: 'decimal', precision: 5, scale: 4, default: 1 })
    confidence: number;

    @Column({ name: 'is_read', default: false })
    isRead: boolean;

    @Column({ name: 'is_actioned', default: false })
    isActioned: boolean;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
}
