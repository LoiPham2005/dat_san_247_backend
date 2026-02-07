import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReviewFilterDto } from './dto/review-filter.dto';

@Injectable()
export class ReviewsService {
    constructor(private prisma: PrismaService) { }

    async findAll(filter: ReviewFilterDto) {
        const { page = 1, limit = 10, rating, venueId, isVisible } = filter;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (rating) where.rating = Number(rating);
        if (venueId) where.venue_id = venueId;
        if (isVisible !== undefined) {
            const isVisibleBool = String(isVisible) === 'true';
            where.is_visible = isVisibleBool;
        }

        const [items, total] = await Promise.all([
            this.prisma.reviews.findMany({
                where,
                include: {
                    users: true, // Check relation name. Usually plural or match model name 'users'. 
                    // TypeORM 'user' -> Prisma 'users' (relation field) or 'user' (if renamed).
                    // Most generated schemas use 'users'. I'll try 'users'.
                    venues: true,
                    bookings: true,
                },
                orderBy: { created_at: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.reviews.count({ where })
        ]);

        const totalPages = Math.ceil(total / limit);

        // Map results if necessary to match old entity structure (camelCase)
        // TypeORM returned camelCase entities. Prisma returns snake_case (usually).
        // I should map.
        const mappedItems = items.map(item => ({
            ...item,
            userId: item.user_id,
            venueId: item.venue_id,
            bookingId: item.booking_id,
            isVisible: item.is_visible,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
            // relations
            user: item.users,
            venue: item.venues,
            booking: item.bookings,
        }));

        return {
            items: mappedItems,
            meta: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        };
    }

    async findOne(id: string) {
        const review = await this.prisma.reviews.findUnique({
            where: { id },
            include: { users: true, venues: true }
        });
        if (!review) throw new NotFoundException('Review not found');

        return {
            ...review,
            userId: review.user_id,
            venueId: review.venue_id,
            bookingId: review.booking_id,
            isVisible: review.is_visible,
            createdAt: review.created_at,
            updatedAt: review.updated_at,
            user: review.users,
            venue: review.venues,
        };
    }

    async toggleVisibility(id: string, isVisible?: boolean) {
        const review = await this.prisma.reviews.findUnique({ where: { id } });
        if (!review) throw new NotFoundException('Review not found');

        const newValue = isVisible !== undefined ? isVisible : !review.is_visible;

        return this.prisma.reviews.update({
            where: { id },
            data: { is_visible: newValue }
        });
    }

    async softDelete(id: string) {
        // Check if soft delete supported (deleted_at)
        return this.prisma.reviews.update({
            where: { id },
            data: { deleted_at: new Date() }
        });
    }

    async createReview(userId: string, data: any) {
        return this.prisma.$transaction(async (tx) => {
            const review = await tx.reviews.create({
                data: {
                    user_id: userId,
                    venue_id: data.venueId,
                    booking_id: data.bookingId,
                    rating: data.rating,
                    comment: data.comment,
                    is_visible: true,
                }
            });

            if (data.images && Array.isArray(data.images)) {
                for (let i = 0; i < data.images.length; i++) {
                    await (tx.files as any).create({
                        data: {
                            user_id: userId,
                            original_name: `review-${review.id}-${i}`,
                            file_name: `review-${review.id}-${i}`,
                            public_url: data.images[i],
                            file_size: 0,
                            mime_type: 'image/jpeg',
                            target_type: 'REVIEW',
                            target_id: review.id,
                            display_order: i,
                            category: 'REVIEW_IMAGE' as any
                        }
                    });
                }
            }

            return review;
        });
    }
}
