import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TicketStatus } from '../../common/constants/chat.constant';

@Injectable()
export class SupportService {
    constructor(private prisma: PrismaService) { }

    private mapTicket(ticket: any) {
        if (!ticket) return null;
        return {
            ...ticket,
            customer: ticket.customers,
            assignedTo: ticket.agents,
            booking: ticket.bookings,
            venue: ticket.venues,
            ticketNumber: ticket.ticket_number,
            createdAt: ticket.created_at,
            updatedAt: ticket.updated_at,
        };
    }

    async findAllTickets(filter: any) {
        const { status, priority, assignedToId } = filter;
        const where: any = {};
        if (status) where.status = status;
        if (priority) where.priority = priority;
        if (assignedToId) where.assigned_to_id = assignedToId;

        const tickets = await this.prisma.support_tickets.findMany({
            where,
            include: {
                customers: true,
                agents: true,
            } as any,
            orderBy: { created_at: 'desc' },
        });

        return tickets.map(t => this.mapTicket(t));
    }

    async findOneTicket(id: string) {
        const ticket = await this.prisma.support_tickets.findUnique({
            where: { id },
            include: {
                customers: true,
                agents: true,
                bookings: true,
                venues: true,
            } as any,
        });
        if (!ticket) throw new NotFoundException('Ticket not found');
        return this.mapTicket(ticket);
    }

    async updateTicket(id: string, data: any) {
        const updateData: any = {};
        if (data.status) updateData.status = data.status;
        if (data.assigned_to_id) updateData.assigned_to_id = data.assigned_to_id;

        await this.prisma.support_tickets.update({
            where: { id },
            data: updateData,
        });

        return this.findOneTicket(id);
    }

    async createTicket(data: any) {
        return this.prisma.support_tickets.create({
            data: {
                subject: data.subject,
                description: data.description,
                customer_id: data.customerId,
                priority: data.priority,
                status: 'OPEN',
                ticket_number: `TICKET-${Date.now()}`,
                booking_id: data.bookingId,
                venue_id: data.venueId,
            }
        });
    }

    async getStats() {
        const [total, open, inProgress, resolved] = await Promise.all([
            this.prisma.support_tickets.count(),
            this.prisma.support_tickets.count({ where: { status: 'OPEN' } }),
            this.prisma.support_tickets.count({ where: { status: 'IN_PROGRESS' } }),
            this.prisma.support_tickets.count({ where: { status: 'RESOLVED' } }),
        ]);
        return { total, open, inProgress, resolved };
    }
}
