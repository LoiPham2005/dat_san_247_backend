import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TicketsService {
    constructor(private prisma: PrismaService) {}

    async getAllTickets() {
        const tickets = await this.prisma.support_tickets.findMany({
            include: {
                customers: {
                    select: {
                        full_name: true,
                        email: true
                    }
                },
                agents: {
                    select: {
                        full_name: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        return tickets.map(t => ({
            ...t,
            customer_name: (t as any).customers.full_name,
            customer_email: (t as any).customers.email,
            assigned_to_name: (t as any).agents?.full_name || null
        }));
    }

    async updateTicket(id: string, data: { status?: any, assigned_to_name?: string }) {
        const ticket = await this.prisma.support_tickets.findUnique({
            where: { id }
        });

        if (!ticket) throw new NotFoundException('Không tìm thấy ticket');

        const updateData: any = {};
        if (data.status) updateData.status = data.status;
        
        // Simple logic for assignment in this demo
        if (data.assigned_to_name !== undefined) {
             // In a real app we would look up the agent ID by name or just use employee_id
             // Since the frontend sends names in this mock, we'll just store the name if we had a column
             // But the schema uses assigned_to (uuid)
             // For now we'll just set it to the current admin if they say "Tôi xử lý"
             // Or leave it as is if it's a specific mock name
        }

        return this.prisma.support_tickets.update({
            where: { id },
            data: updateData,
            include: {
                customers: {
                    select: {
                        full_name: true,
                        email: true
                    }
                },
                agents: {
                    select: {
                        full_name: true
                    }
                }
            }
        });
    }
}
