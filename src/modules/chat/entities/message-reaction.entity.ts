import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Message } from './message.entity';
import { User } from '../../users/entities/user.entity';

@Entity('chat_message_reactions')
@Unique(['messageId', 'userId', 'emoji'])
export class MessageReaction extends BaseEntity {
    @Column({ name: 'message_id', type: 'uuid' })
    messageId: string;

    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @Column({ length: 10 })
    emoji: string;

    @ManyToOne(() => Message, (message) => message.messageReactions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'message_id' })
    message: Message;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
}
