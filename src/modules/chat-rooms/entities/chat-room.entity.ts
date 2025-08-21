import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import { Venue } from '../../venues/entities/venue.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { ChatRoomMember } from 'src/modules/chat-room-members/entities/chat-room-member.entity';
import { Message } from 'src/modules/messages/entities/message.entity';

@Entity('chat_rooms')
export class ChatRoom {
    @PrimaryGeneratedColumn({ name: 'room_id' })
    roomId: number;

    @Column({ length: 255, nullable: true, name: 'room_name' })
    roomName: string;

    @Column({ type: 'boolean', default: false, name: 'is_group' })
    isGroup: boolean;

    @Column({ type: 'int', nullable: true, name: 'venue_id' })
    venueId: number;

    @ManyToOne(() => Venue)
    @JoinColumn({ name: 'venue_id' })
    venue: Venue;

    @Column({ type: 'int', nullable: true, name: 'booking_id' })
    bookingId: number;

    @ManyToOne(() => Booking)
    @JoinColumn({ name: 'booking_id' })
    booking: Booking;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    // Chỉ dùng Message entity
    @OneToMany(() => Message, (message) => message.room)
    messages: Message[];

    @OneToMany(() => ChatRoomMember, (member) => member.room)
    members: ChatRoomMember[];
}
