// =====================================================
// 13. SUPPORT_TICKET ENTITY
// =====================================================
// modules/support/entities/support-ticket.entity.ts
import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { StaffProfile } from '../../staff/entities/staff-profile.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { SupportMessage } from './support-message.entity';

export enum TicketCategory {
  BOOKING_ISSUE = 'booking_issue',
  PAYMENT_ISSUE = 'payment_issue',
  TECHNICAL = 'technical',
  COMPLAINT = 'complaint',
  OTHER = 'other',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  WAITING_CUSTOMER = 'waiting_customer',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

@Entity('support_tickets')
@Index(['userId'])
@Index(['ticketCode'])
@Index(['status'])
export class SupportTicket extends BaseEntity {
  @Column({ name: 'ticket_code', unique: true, length: 50 })
  ticketCode: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'enum', enum: TicketCategory })
  category: TicketCategory;

  @Column({ length: 300 })
  subject: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: TicketPriority })
  priority: TicketPriority;

  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.OPEN })
  status: TicketStatus;

  @Column({ name: 'assigned_to', type: 'uuid', nullable: true })
  assignedTo?: string;

  @Column({ name: 'related_booking_id', type: 'uuid', nullable: true })
  relatedBookingId?: string;

  @Column({ type: 'json', nullable: true })
  attachments?: string[];

  @Column({ name: 'resolved_at', type: 'timestamp', nullable: true })
  resolvedAt?: Date;

  @Column({ name: 'resolution_note', type: 'text', nullable: true })
  resolutionNote?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => StaffProfile, { nullable: true })
  @JoinColumn({ name: 'assigned_to' })
  assignedStaff?: StaffProfile;

  @ManyToOne(() => Booking, { nullable: true })
  @JoinColumn({ name: 'related_booking_id' })
  relatedBooking?: Booking;

  @OneToMany(() => SupportMessage, (message) => message.ticket)
  messages: SupportMessage[];
}