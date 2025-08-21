import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ChatRoom } from '../../chat-rooms/entities/chat-room.entity';
import { User } from 'src/modules/auth/entities/user.entity';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  BOOKING_INQUIRY = 'booking_inquiry',
  SYSTEM = 'system',
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn({ name: 'message_id' })
  messageId: number;

  @Column({ name: 'room_id' })
  roomId: number;

  @ManyToOne(() => ChatRoom, (room) => room.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room: ChatRoom;

  @Column({ name: 'sender_id' })
  senderId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column({ type: 'text', name: 'message_text' })
  messageText: string;

  @Column({ type: 'enum', enum: MessageType, default: MessageType.TEXT, name: 'message_type' })
  messageType: MessageType;

  @Column({ length: 500, nullable: true, name: 'attachment_url' })
  attachmentUrl: string;

  @Column({ type: 'boolean', default: false, name: 'is_read' })
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'read_at' })
  readAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
