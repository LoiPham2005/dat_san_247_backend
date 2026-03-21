import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InvoiceService {
    constructor(private prisma: PrismaService) {}

    async getInvoices(userId: string) {
        return this.prisma.invoices.findMany({
            where: { customer_id: userId },
            include: {
                bookings: {
                    select: {
                        booking_code: true,
                        venues: {
                            select: { name: true }
                        },
                        booking_date: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });
    }
}
