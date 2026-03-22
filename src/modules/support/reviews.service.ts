import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReviewsService {
    constructor(private prisma: PrismaService) {}

    async getAllReviews() {
        const reviews = await this.prisma.reviews.findMany({
            include: {
                users: {
                    select: {
                        full_name: true
                    }
                },
                venues: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        return reviews.map(r => ({
            ...r,
            customer_name: (r as any).users.full_name,
            venue_name: (r as any).venues.name,
        }));
    }

    async updateReview(id: string, data: { response?: string, is_visible?: boolean }, userId?: string) {
        const review = await this.prisma.reviews.findUnique({
            where: { id }
        });

        if (!review) throw new NotFoundException('Không tìm thấy đánh giá');

        const updateData: any = { ...data };
        
        if (data.response !== undefined) {
            updateData.responded_at = new Date();
            updateData.responded_by = userId;
        }

        if (data.is_visible !== undefined && data.is_visible === false) {
            updateData.hidden_by = userId;
            updateData.hidden_reason = 'Kiểm duyệt hệ thống';
        }

        return this.prisma.reviews.update({
            where: { id },
            data: updateData,
            include: {
                users: { select: { full_name: true } },
                venues: { select: { name: true } }
            }
        });
    }

    async deleteReview(id: string) {
        const review = await this.prisma.reviews.findUnique({
            where: { id }
        });

        if (!review) throw new NotFoundException('Không tìm thấy đánh giá');

        // Hard delete or soft delete? 
        // The schema has deleted_at, so we can do soft delete.
        return this.prisma.reviews.update({
            where: { id },
            data: { deleted_at: new Date() }
        });
    }
}
