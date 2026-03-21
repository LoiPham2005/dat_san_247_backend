import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReplyReviewDto } from './dto/reply-review.dto';

@Injectable()
export class ReviewsService {
    constructor(private prisma: PrismaService) {}

    async getOwnerReviews(ownerId: string, venueId?: string) {
        return this.prisma.reviews.findMany({
            where: {
                venues: {
                    owner_id: ownerId,
                    ...(venueId ? { id: venueId } : {})
                }
            },
            include: {
                users: {
                    select: {
                        id: true,
                        full_name: true,
                        avatar_url: true
                    }
                },
                venues: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                courts: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });
    }

    async replyToReview(ownerId: string, reviewId: string, data: ReplyReviewDto) {
        const review = await this.prisma.reviews.findUnique({
            where: { id: reviewId },
            include: { venues: true }
        });

        if (!review) throw new NotFoundException('Không tìm thấy đánh giá');
        if (review.venues.owner_id !== ownerId) {
            throw new ForbiddenException('Bạn không có quyền phản hồi đánh giá này');
        }

        return this.prisma.reviews.update({
            where: { id: reviewId },
            data: {
                response: data.reply_comment,
                responded_at: new Date(),
                responded_by: ownerId
            }
        });
    }

    async createReview(userId: string, data: CreateReviewDto) {
        // Verify booking exists and belongs to user and is COMPLETED
        const booking = await this.prisma.bookings.findUnique({
            where: { id: data.booking_id }
        });

        if (!booking) throw new NotFoundException('Không tìm thấy đơn đặt sân');
        if (booking.customer_id !== userId) throw new ForbiddenException('Bạn không có quyền đánh giá đơn này');
        // if (booking.status !== 'COMPLETED') throw new BadRequestException('Bạn chỉ có thể đánh giá sau khi đã hoàn thành sử dụng sân');

        // Check if already reviewed
        const existing = await this.prisma.reviews.findFirst({
            where: { booking_id: data.booking_id }
        });
        if (existing) throw new BadRequestException('Đơn này đã được đánh giá rồi');

        const review = await this.prisma.reviews.create({
            data: {
                user_id: userId,
                booking_id: data.booking_id,
                venue_id: booking.venue_id,
                court_id: booking.court_id,
                rating: data.rating,
                rating_cleanliness: data.rating_cleanliness,
                rating_facilities: data.rating_facilities,
                rating_staff: data.rating_staff,
                comment: data.comment,
                is_visible: true
            }
        });

        // Handle Media Attachments
        const mediaUrls = [...(data.images || []), ...(data.videos || [])];
        if (mediaUrls.length > 0) {
            await this.handleMediaAttachments(review.id, mediaUrls);
        }

        return review;
    }

    private async handleMediaAttachments(reviewId: string, mediaUrls: string[]) {
        if (mediaUrls.length === 0) return;

        // Find existing files by URLs
        const files = await this.prisma.files.findMany({
            where: { public_url: { in: mediaUrls } }
        });

        const attachments = files.map((file, index) => ({
            review_id: reviewId,
            file_id: file.id,
            display_order: index
        }));

        if (attachments.length > 0) {
            await this.prisma.media_attachments.createMany({
                data: attachments
            });
        }
    }

    async getVenueReviews(venueId: string) {
        return this.prisma.reviews.findMany({
            where: { venue_id: venueId, is_visible: true },
            include: {
                users: {
                    select: {
                        full_name: true,
                        avatar_url: true
                    }
                },
                media_attachments: {
                    include: {
                        files: {
                            select: { public_url: true, mime_type: true }
                        }
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });
    }

    async getMyReviews(userId: string) {
        return this.prisma.reviews.findMany({
            where: { user_id: userId },
            include: {
                venues: {
                    select: { name: true }
                },
                courts: {
                    select: { name: true }
                },
                media_attachments: {
                    include: {
                        files: {
                            select: { public_url: true, mime_type: true }
                        }
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });
    }

    async updateReview(userId: string, id: string, data: UpdateReviewDto) {
        const review = await this.prisma.reviews.findUnique({
            where: { id }
        });

        if (!review) throw new NotFoundException('Không tìm thấy đánh giá');
        if (review.user_id !== userId) throw new ForbiddenException('Bạn không có quyền sửa đánh giá này');
        if (review.response) throw new BadRequestException('Không thể sửa đánh giá đã được phản hồi');

        const updatedReview = await this.prisma.reviews.update({
            where: { id },
            data: {
                rating: data.rating,
                rating_cleanliness: data.rating_cleanliness,
                rating_facilities: data.rating_facilities,
                rating_staff: data.rating_staff,
                comment: data.comment,
                updated_at: new Date()
            }
        });

        // Sync Media Attachments
        if (data.images || data.videos) {
            const mediaUrls = [...(data.images || []), ...(data.videos || [])];
            await this.prisma.media_attachments.deleteMany({ where: { review_id: id } });
            if (mediaUrls.length > 0) {
                await this.handleMediaAttachments(id, mediaUrls);
            }
        }

        return updatedReview;
    }

    async deleteReview(userId: string, id: string) {
        const review = await this.prisma.reviews.findUnique({
            where: { id }
        });

        if (!review) throw new NotFoundException('Không tìm thấy đánh giá');
        if (review.user_id !== userId) throw new ForbiddenException('Bạn không có quyền xóa đánh giá này');
        if (review.response) throw new BadRequestException('Không thể xóa đánh giá đã được phản hồi');

        return this.prisma.reviews.delete({
            where: { id }
        });
    }
}
