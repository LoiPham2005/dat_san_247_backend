// modules/support/support.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SupportTicket,
  TicketStatus,
  TicketCategory,
} from './entities/support-ticket.entity';
import {
  SupportMessage,
  SenderType,
} from './entities/support-message.entity';
import { CreateTicketDto, AddMessageDto } from './dto/create-ticket.dto';
import { EmailService } from '../../shared/services/email.service';

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(SupportTicket)
    private ticketRepository: Repository<SupportTicket>,
    @InjectRepository(SupportMessage)
    private messageRepository: Repository<SupportMessage>,
    private emailService: EmailService,
  ) {}

  async createTicket(
    userId: string,
    createTicketDto: CreateTicketDto,
  ): Promise<SupportTicket> {
    const ticketCode = this.generateTicketCode();

    const ticket = this.ticketRepository.create({
      ...createTicketDto,
      userId,
      ticketCode,
      status: TicketStatus.OPEN,
    });

    const savedTicket = await this.ticketRepository.save(ticket);

    // Send email notification
    // await this.emailService.sendTicketCreated(userId, savedTicket);

    return savedTicket;
  }

  async getUserTickets(userId: string): Promise<SupportTicket[]> {
    return this.ticketRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getTicket(ticketId: string, userId: string): Promise<SupportTicket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId, userId },
      relations: ['messages', 'messages.sender'],
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  async addMessage(
    ticketId: string,
    userId: string,
    addMessageDto: AddMessageDto,
  ): Promise<SupportMessage> {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId, userId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const message = this.messageRepository.create({
      ticketId,
      senderId: userId,
      senderType: SenderType.CUSTOMER,
      message: addMessageDto.message,
      attachments: addMessageDto.attachments,
    });

    const savedMessage = await this.messageRepository.save(message);

    // Update ticket status
    if (ticket.status === TicketStatus.WAITING_CUSTOMER) {
      ticket.status = TicketStatus.IN_PROGRESS;
      await this.ticketRepository.save(ticket);
    }

    return savedMessage;
  }

  async closeTicket(ticketId: string, userId: string): Promise<void> {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId, userId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    ticket.status = TicketStatus.CLOSED;
    await this.ticketRepository.save(ticket);
  }

  // Staff methods
  async getAllTickets(status?: TicketStatus): Promise<SupportTicket[]> {
    const query = this.ticketRepository.createQueryBuilder('ticket');

    if (status) {
      query.where('ticket.status = :status', { status });
    }

    return query
      .orderBy('ticket.priority', 'DESC')
      .addOrderBy('ticket.created_at', 'ASC')
      .getMany();
  }

  async assignTicket(
    ticketId: string,
    staffId: string,
  ): Promise<SupportTicket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    ticket.assignedTo = staffId;
    ticket.status = TicketStatus.IN_PROGRESS;

    return this.ticketRepository.save(ticket);
  }

  async addStaffMessage(
    ticketId: string,
    staffId: string,
    message: string,
    isInternal: boolean = false,
  ): Promise<SupportMessage> {
    const staffMessage = this.messageRepository.create({
      ticketId,
      senderId: staffId,
      senderType: SenderType.STAFF,
      message,
      isInternal,
    });

    return this.messageRepository.save(staffMessage);
  }

  async resolveTicket(
    ticketId: string,
    resolutionNote: string,
  ): Promise<SupportTicket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    ticket.status = TicketStatus.RESOLVED;
    ticket.resolvedAt = new Date();
    ticket.resolutionNote = resolutionNote;

    return this.ticketRepository.save(ticket);
  }

  private generateTicketCode(): string {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `TKT${timestamp}${random}`;
  }
}