import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus } from './entities/ticket.entity';

@Injectable()
export class SupportService {
    constructor(
        @InjectRepository(Ticket)
        private ticketRepository: Repository<Ticket>,
    ) { }

    async findAllTickets(filter: any) {
        const { status, priority, assignedTo } = filter;
        const query = this.ticketRepository.createQueryBuilder('ticket')
            .leftJoinAndSelect('ticket.user', 'user')
            .leftJoinAndSelect('ticket.assignedStaff', 'assignedStaff');

        if (status) query.andWhere('ticket.status = :status', { status });
        if (priority) query.andWhere('ticket.priority = :priority', { priority });
        if (assignedTo) query.andWhere('ticket.assignedTo = :assignedTo', { assignedTo });

        return query.orderBy('ticket.createdAt', 'DESC').getMany();
    }

    async findOneTicket(id: string) {
        const ticket = await this.ticketRepository.findOne({
            where: { id },
            relations: ['user', 'assignedStaff'],
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
