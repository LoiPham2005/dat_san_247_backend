import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReplyReviewDto } from './dto/reply-review.dto';
import * as path from 'path';

@Injectable()
export class ReviewsService {
    constructor(private prisma: PrismaService) {}

    private async _verifyVenueAccess(userId: string, venueId: string) {
        let finalVenueId = venueId;
        
        // Handle Mock VN-1
        if (venueId === 'VN-1') {
            const staffRecord = await this.prisma.venue_staff.findFirst({
                where: { user_id: userId, is_active: true }
            });
            if (staffRecord) {
                finalVenueId = staffRecord.venue_id;
            } else {
                 const ownedVenue = await this.prisma.venues.findFirst({
                    where: { owner_id: userId, deleted_at: null }
                });
                if (ownedVenue) {
                    finalVenueId = ownedVenue.id;
                } else {
                    throw new NotFoundException('Bạn không được gán cho bất kỳ cơ sở nào trong hệ thống.');
                }
            }
        }

        const venue = await this.prisma.venues.findUnique({
            where: { id: finalVenueId }
        });

        if (!venue) throw new NotFoundException('Không tìm thấy cơ sở');

        if (venue.owner_id !== userId) {
            const isStaff = await this.prisma.venue_staff.findFirst({
                where: { venue_id: finalVenueId, user_id: userId, is_active: true }
            });
            if (!isStaff) {
                throw new ForbiddenException('Bạn không có quyền truy cập cơ sở này');
            }
        }

        return { ...venue, id: finalVenueId };
    }

    async getOwnerReviews(userId: string, venueId?: string) {
        let finalVenueId = venueId;
        
        if (venueId) {
            const venue = await this._verifyVenueAccess(userId, venueId);
            finalVenueId = venue.id;
        }

        return this.prisma.reviews.findMany({
            where: {
                venues: {
                    ...(finalVenueId ? { id: finalVenueId } : { owner_id: userId })
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
                },
                media_attachments: {
                    include: {
                        files: {
                            select: {
                                public_url: true,
                                mime_type: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });
    }

    async replyToReview(userId: string, reviewId: string, data: ReplyReviewDto) {
        const review = await this.prisma.reviews.findUnique({
            where: { id: reviewId }
        });

        if (!review) throw new NotFoundException('Không tìm thấy đánh giá');
        
        await this._verifyVenueAccess(userId, review.venue_id);

        return this.prisma.reviews.update({
            where: { id: reviewId },
            data: {
                response: data.reply_comment,
                responded_at: new Date(),
                responded_by: userId
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

        const attachments: any[] = [];

        for (const [index, url] of mediaUrls.entries()) {
            let file = await this.prisma.files.findFirst({
                where: { public_url: url }
            });

            if (!file) {
                // Tự động tạo bản ghi file nếu chưa có (phòng trường hợp controller upload không lưu vào DB)
                file = await this.prisma.files.create({
                    data: {
                        original_name: path.basename(url),
                        file_name: path.basename(url),
                        file_size: 0,
                        mime_type: url.toLowerCase().match(/\.(mp4|mov|avi|wmv|webm)$/) ? 'video/mp4' : 'image/jpeg',
                        public_url: url
                    }
                });
            }

            attachments.push({
                review_id: reviewId,
                file_id: file.id,
                display_order: index
            });
        }

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

    async getAllReviewsForAdmin() {
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
            customer_name: r.users.full_name,
            venue_name: r.venues.name
        }));
    }

    async toggleReviewVisibility(id: string, isVisible: boolean) {
        return this.prisma.reviews.update({
            where: { id },
            data: { is_visible: isVisible }
        });
    }
}
