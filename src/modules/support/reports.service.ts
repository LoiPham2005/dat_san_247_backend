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

        // Collect names for targets (batch fetching for polymorphic relation)
        const userIds = reports.filter(r => r.target_type === 'USER').map(r => r.target_id);
        const venueIds = reports.filter(r => r.target_type === 'VENUE').map(r => r.target_id);
        const reviewIds = reports.filter(r => r.target_type === 'REVIEW').map(r => r.target_id);

        const [users, venues, reviews] = await Promise.all([
            userIds.length > 0 ? this.prisma.users.findMany({ where: { id: { in: userIds } }, select: { id: true, full_name: true } }) : Promise.resolve([]),
            venueIds.length > 0 ? this.prisma.venues.findMany({ where: { id: { in: venueIds } }, select: { id: true, name: true } }) : Promise.resolve([]),
            reviewIds.length > 0 ? this.prisma.reviews.findMany({ where: { id: { in: reviewIds } }, select: { id: true, comment: true } }) : Promise.resolve([])
        ]);

        const userMap = new Map(users.map(u => [u.id, u.full_name] as [string, string]));
        const venueMap = new Map(venues.map(v => [v.id, v.name] as [string, string]));
        const reviewMap = new Map(reviews.map(r => [r.id, r.comment?.substring(0, 30) || 'Đánh giá không có bình luận'] as [string, string]));

        return reports.map(r => ({
            ...r,
            reporter_name: (r as any).reporters.full_name,
            target_name: r.target_type === 'USER' ? userMap.get(r.target_id) :
                         r.target_type === 'VENUE' ? venueMap.get(r.target_id) :
                         r.target_type === 'REVIEW' ? reviewMap.get(r.target_id) : 'N/A'
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

    async createReport(reporterId: string, data: { target_type: any, target_id: string, reason: any, description?: string }) {
        return this.prisma.reports.create({
            data: {
                reporter_id: reporterId,
                target_type: data.target_type,
                target_id: data.target_id,
                reason: data.reason,
                description: data.description,
                status: 'PENDING'
            }
        });
    }
}
