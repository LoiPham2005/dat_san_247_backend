import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportsService {
    constructor(private prisma: PrismaService) {}

    async getAllReports() {
        const reports = await this.prisma.reports.findMany({
            include: {
                reporters: {
                    select: {
                        full_name: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        return reports.map(r => ({
            ...r,
            reporter_name: (r as any).reporters.full_name,
        }));
    }

    async updateReport(id: string, data: { status: any, action?: any }) {
        const report = await this.prisma.reports.findUnique({
             where: { id } 
        });

        if (!report) throw new NotFoundException('Không tìm thấy báo cáo');

        return this.prisma.reports.update({
            where: { id },
            data: {
                status: data.status,
                action_taken: data.action || report.action_taken,
                reviewed_at: new Date()
            }
        });
    }
}
