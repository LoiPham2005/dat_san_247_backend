// =====================================================
// 14. SUPPORT_MESSAGE ENTITY
// =====================================================
// modules/support/entities/support-message.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { SupportTicket } from './support-ticket.entity';
import { User } from '../../users/entities/user.entity';

export enum SenderType {
  CUSTOMER = 'customer',
  STAFF = 'staff',
  SYSTEM = 'system',
}

@Entity('support_messages')
@Index(['ticketId'])
export class SupportMessage extends BaseEntity {
  @Column({ name: 'ticket_id', type: 'uuid' })
  ticketId: string;

  @Column({ name: 'sender_id', type: 'uuid' })
  senderId: string;

  @Column({ name: 'sender_type', type: 'enum', enum: SenderType })
  senderType: SenderType;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'json', nullable: true })
  attachments?: string[];

  @Column({ name: 'is_internal', default: false })
  isInternal: boolean;

  @ManyToOne(() => SupportTicket, (ticket) => ticket.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticket_id' })
  ticket: SupportTicket;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_id' })
  sender: User;
}