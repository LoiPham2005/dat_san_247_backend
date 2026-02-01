import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportTicket } from './entities/support-ticket.entity';
import { TicketStatus } from '../../common/constants/chat.constant';

@Injectable()
export class SupportService {
    constructor(
        @InjectRepository(SupportTicket)
        private ticketRepository: Repository<SupportTicket>,
    ) { }

    async findAllTickets(filter: any) {
        const { status, priority, assignedToId } = filter;
        const query = this.ticketRepository.createQueryBuilder('ticket')
            .leftJoinAndSelect('ticket.customer', 'customer')
            .leftJoinAndSelect('ticket.assignedTo', 'assignedTo');

        if (status) query.andWhere('ticket.status = :status', { status });
        if (priority) query.andWhere('ticket.priority = :priority', { priority });
        if (assignedToId) query.andWhere('ticket.assignedToId = :assignedToId', { assignedToId });

        return query.orderBy('ticket.createdAt', 'DESC').getMany();
    }

    async findOneTicket(id: string) {
        const ticket = await this.ticketRepository.findOne({
            where: { id },
            relations: ['customer', 'assignedTo', 'conversation', 'booking', 'venue'],
        });
        if (!ticket) throw new NotFoundException('Ticket not found');
        return ticket;
    }

    async updateTicket(id: string, data: any) {
        await this.ticketRepository.update(id, data);
        return this.findOneTicket(id);
    }

    async createTicket(data: any) {
        const ticket = this.ticketRepository.create(data);
        return this.ticketRepository.save(ticket);
    }

    async getStats() {
        const open = await this.ticketRepository.count({ where: { status: TicketStatus.OPEN } });
        const inProgress = await this.ticketRepository.count({ where: { status: TicketStatus.IN_PROGRESS } });
        return { open, inProgress };
    }
}
