import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SupportTicket } from './entities/support-ticket.entity';
import { TicketStatus } from '../../common/constants/chat.constant';

@Injectable()
export class SupportService {
    constructor(private prisma: PrismaService) { }

    private mapTicket(ticket: any) {
        if (!ticket) return null;
        return {
            ...ticket,
            // Map relations
            customer: ticket.users_support_tickets_customer_idTousers,
            assignedTo: ticket.users_support_tickets_assigned_to_idTousers,
            booking: ticket.bookings,
            venue: ticket.venues,
            // Map fields if necessary (snake_case -> camelCase is automatic?)
            // Prisma returns snake_case for DB fields if not mapped in schema.
            // Schema has properties 'customer_id', etc.
            customerId: ticket.customer_id,
            assignedToId: ticket.assigned_to_id,
            bookingId: ticket.booking_id,
            venueId: ticket.venue_id,
            ticketNumber: ticket.ticket_number,
            createdAt: ticket.created_at,
            updatedAt: ticket.updated_at,
            resolvedAt: ticket.resolved_at,
            firstResponseAt: ticket.first_response_at,
            closedAt: ticket.closed_at,
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
                users_support_tickets_customer_idTousers: true,
                users_support_tickets_assigned_to_idTousers: true,
            },
            orderBy: { created_at: 'desc' },
        });

        return tickets.map(t => this.mapTicket(t));
    }

    async findOneTicket(id: string) {
        const ticket = await this.prisma.support_tickets.findUnique({
            where: { id },
            include: {
                users_support_tickets_customer_idTousers: true,
                users_support_tickets_assigned_to_idTousers: true,
                bookings: true,
                venues: true,
            },
        });
        if (!ticket) throw new NotFoundException('Ticket not found');
        return this.mapTicket(ticket);
    }

    async updateTicket(id: string, data: any) {
        // Data might be camelCase, map to snake_case
        const updateData: any = {};
        if (data.status) updateData.status = data.status;
        if (data.priority) updateData.priority = data.priority;
        if (data.assignedToId) updateData.assigned_to_id = data.assignedToId;
        if (data.resolution) updateData.resolution = data.resolution;
        if (data.resolvedBy) updateData.resolved_by = data.resolvedBy;
        if (data.resolvedAt) updateData.resolved_at = data.resolvedAt;
        if (data.customerRating) updateData.customer_rating = data.customerRating;
        if (data.customerFeedback) updateData.customer_feedback = data.customerFeedback;

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
                customer_id: data.customerId, // assuming coming as customerId
                category: data.category,
                priority: data.priority,
                status: 'OPEN',
                ticket_number: `TICKET-${Date.now()}`, // Simple generation
                booking_id: data.bookingId,
                venue_id: data.venueId,
                created_at: new Date(),
                updated_at: new Date(),
            }
        });
    }

    async getStats() {
        const open = await this.prisma.support_tickets.count({ where: { status: TicketStatus.OPEN } });
        const inProgress = await this.prisma.support_tickets.count({ where: { status: TicketStatus.IN_PROGRESS } });
        return { open, inProgress };
    }
}
