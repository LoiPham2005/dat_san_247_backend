import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AuditService {
    constructor(private prisma: PrismaService) {}

    async getAllLogs(limit: number = 100) {
        return this.prisma.audit_logs.findMany({
            orderBy: { created_at: 'desc' },
            take: limit
        });
    }

    async getLogsByUser(userId: string) {
        return this.prisma.audit_logs.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' }
        });
    }
}
