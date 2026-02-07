import { Entity, Column, ManyToOne, JoinColumn, Unique, Relation } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { MessageStatus } from '../../../common/constants/chat.constant';
import { Message } from './message.entity';
import { User } from '../../users/entities/user.entity';

@Entity('chat_message_receipts')
@Unique(['messageId', 'userId'])
export class MessageReceipt extends BaseEntity {
    @Column({ name: 'message_id', type: 'uuid' })
    messageId: string;

    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @Column({
        type: 'enum',
        enum: MessageStatus,
        default: MessageStatus.SENT,
    })
    status: MessageStatus;

    @Column({ name: 'delivered_at', type: 'timestamp', nullable: true })
    deliveredAt: Date;

    @Column({ name: 'read_at', type: 'timestamp', nullable: true })
    readAt: Date;

    @ManyToOne(() => Message, (message) => message.receipts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'message_id' })
    message: Relation<Message>;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: Relation<User>;
}
