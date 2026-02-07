import { Entity, Column, ManyToOne, JoinColumn, Relation } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { NotificationTrigger } from '../../../common/constants/ai.constant';
import { User } from '../../users/entities/user.entity';

@Entity('ai_smart_notifications')
export class AISmartNotification extends BaseEntity {
    @Column({ name: 'user_id' })
    userId: string;

    @Column({
        name: 'trigger_type',
        type: 'enum',
        enum: NotificationTrigger,
    })
    triggerType: NotificationTrigger;

    @Column({ name: 'prediction_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
    predictionScore: number;

    @Column({ name: 'relevant_item_id', nullable: true })
    relevantItemId: string;

    @Column({ name: 'relevant_item_type', nullable: true })
    relevantItemType: string;

    @Column()
    title: string;

    @Column({ type: 'text' })
    message: string;

    @Column({ name: 'cta_text', nullable: true })
    ctaText: string;

    @Column({ name: 'cta_link', nullable: true })
    ctaLink: string;

    @Column({ name: 'optimal_send_time', type: 'timestamp', nullable: true })
    optimalSendTime: Date;

    @Column({ name: 'time_zone', nullable: true })
    timeZone: string;

    @Column({ name: 'is_sent', default: false })
    isSent: boolean;

    @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
    sentAt: Date;

    @Column({ name: 'is_opened', default: false })
    isOpened: boolean;

    @Column({ name: 'opened_at', type: 'timestamp', nullable: true })
    openedAt: Date;

    @Column({ name: 'is_clicked', default: false })
    isClicked: boolean;

    @Column({ name: 'clicked_at', type: 'timestamp', nullable: true })
    clickedAt: Date;

    @Column({ name: 'is_converted', default: false })
    isConverted: boolean;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: Relation<User>;
}
