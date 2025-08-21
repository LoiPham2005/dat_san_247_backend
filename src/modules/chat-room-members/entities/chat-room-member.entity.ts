import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { ChatRoom } from '../../chat-rooms/entities/chat-room.entity';
import { User } from 'src/modules/auth/entities/user.entity';

@Entity('chat_room_members')
export class ChatRoomMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'room_id' })
  roomId: number;

  @ManyToOne(() => ChatRoom, (room) => room.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room: ChatRoom;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;

  @Column({ type: 'boolean', default: false, name: 'is_admin' })
  isAdmin: boolean;
}
