import { Entity, Column, ManyToOne, JoinColumn, Index, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { TicketPriority, TicketStatus, TicketCategory } from '../../../common/constants/chat.constant';
import { User } from '../../users/entities/user.entity';
import { Conversation } from './conversation.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { Venue } from '../../venues/entities/venue.entity';

@Entity('support_tickets')
export class SupportTicket extends BaseEntity {
    @Column({ name: 'ticket_number', unique: true })
    ticketNumber: string;

    @Column({ name: 'customer_id' })
    customerId: string;

    @Column({ name: 'assigned_to_id', nullable: true })
    assignedToId: string;

    @Column({ name: 'assigned_at', type: 'timestamp', nullable: true })
    assignedAt: Date;

    @Column({
        type: 'enum',
        enum: TicketCategory,
    })
    category: TicketCategory;

    @Column({
        type: 'enum',
        enum: TicketPriority,
        default: TicketPriority.MEDIUM,
    })
    priority: TicketPriority;

    @Column({
        type: 'enum',
        enum: TicketStatus,
        default: TicketStatus.OPEN,
    })
    status: TicketStatus;

    @Column()
    subject: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ name: 'booking_id', nullable: true })
    bookingId: string;

    @Column({ name: 'venue_id', nullable: true })
    venueId: string;

    @Column({ name: 'conversation_id', nullable: true })
    conversationId: string;

    @Column({ type: 'text', nullable: true })
    resolution: string;

    @Column({ name: 'resolved_at', type: 'timestamp', nullable: true })
    resolvedAt: Date;

    @Column({ name: 'resolved_by', nullable: true })
    resolvedBy: string;

    @Column({ name: 'customer_rating', nullable: true })
    customerRating: number;

    @Column({ name: 'customer_feedback', type: 'text', nullable: true })
    customerFeedback: string;

    @Column({ name: 'first_response_at', type: 'timestamp', nullable: true })
    firstResponseAt: Date;

    @Column({ name: 'closed_at', type: 'timestamp', nullable: true })
    closedAt: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'customer_id' })
    customer: User;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'assigned_to_id' })
    assignedTo: User;

    @OneToOne(() => Conversation, { nullable: true })
    @JoinColumn({ name: 'conversation_id' })
    conversation: Conversation;

    @ManyToOne(() => Booking, { nullable: true })
    @JoinColumn({ name: 'booking_id' })
    booking: Booking;

    @ManyToOne(() => Venue, { nullable: true })
    @JoinColumn({ name: 'venue_id' })
    venue: Venue;
}
