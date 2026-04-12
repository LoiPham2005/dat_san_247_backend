
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { PromotionStatus } from '@prisma/client';

@Injectable()
export class PromotionsService {
    constructor(private prisma: PrismaService) {}

    async getOwnerPromotions(ownerId: string, venueId: string) {
        const promos = await this.prisma.promotions.findMany({
            where: {
                promotion_venues: { some: { venue_id: venueId } },
                deleted_at: null
            },
            include: {
                promotion_usage: {
                   include: { bookings: true }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        return promos.map(p => ({
            ...p,
            revenue_generated: p.promotion_usage.reduce((sum, u) => sum + Number(u.bookings?.total_amount || 0), 0),
            discount_total: p.promotion_usage.reduce((sum, u) => sum + Number(u.discount_amount || 0), 0)
        }));
    }

    async getPromotionUsage(ownerId: string, promoId: string) {
        const usage = await this.prisma.promotion_usage.findMany({
            where: { promotion_id: promoId },
            include: {
                users: { select: { full_name: true, avatar_url: true } }
            },
            orderBy: { created_at: 'desc' }
        });

        return usage.map(u => ({
            id: u.id,
            user_name: u.users.full_name,
            avatar_url: u.users.avatar_url,
            created_at: u.created_at,
            booking_id: u.booking_id,
            discount_amount: u.discount_amount
        }));
    }

    async createPromotion(ownerId: string, data: CreatePromotionDto) {
        const existing = await this.prisma.promotions.findUnique({
            where: { code: data.code.toUpperCase() }
        });
        if (existing) throw new BadRequestException('Mã khuyến mãi đã tồn tại');

        const { venue_ids, ...promoData } = data;

        return this.prisma.$transaction(async (tx) => {
            const promo = await tx.promotions.create({
                data: {
                    ...promoData,
                    code: data.code.toUpperCase(),
                    created_by: ownerId,
                    discount_value: Number(data.discount_value),
                    max_discount_amount: data.max_discount_amount ? Number(data.max_discount_amount) : null,
                    min_booking_amount: data.min_booking_amount ? Number(data.min_booking_amount) : 0,
                    valid_from: new Date(data.valid_from),
                    valid_to: new Date(data.valid_to)
                }
            });

            if (venue_ids && venue_ids.length > 0) {
                await tx.promotion_venues.createMany({
                    data: venue_ids.map(vId => ({
                        promotion_id: promo.id,
                        venue_id: vId
                    }))
                });
            }

            return promo;
        });
    }

    async updatePromotion(ownerId: string, id: string, data: UpdatePromotionDto) {
        const promo = await this.prisma.promotions.findUnique({
            where: { id },
            include: { promotion_venues: true }
        });

        if (!promo) throw new NotFoundException('Không tìm thấy khuyến mãi');
        if (promo.created_by !== ownerId) throw new ForbiddenException('Bạn không có quyền sửa khuyến mãi này');

        const { venue_ids, ...promoData } = data;

        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.promotions.update({
                where: { id },
                data: {
                    ...promoData,
                    code: data.code ? data.code.toUpperCase() : undefined,
                    discount_value: data.discount_value ? Number(data.discount_value) : undefined,
                    max_discount_amount: data.max_discount_amount !== undefined ? (data.max_discount_amount ? Number(data.max_discount_amount) : null) : undefined,
                    min_booking_amount: data.min_booking_amount ? Number(data.min_booking_amount) : undefined,
                    valid_from: data.valid_from ? new Date(data.valid_from) : undefined,
                    valid_to: data.valid_to ? new Date(data.valid_to) : undefined
                }
            });

            if (venue_ids) {
                await tx.promotion_venues.deleteMany({ where: { promotion_id: id } });
                if (venue_ids.length > 0) {
                    await tx.promotion_venues.createMany({
                        data: venue_ids.map(vId => ({
                            promotion_id: id,
                            venue_id: vId
                        }))
                    });
                }
            }

            return updated;
        });
    }

    async toggleStatus(ownerId: string, id: string) {
        const promo = await this.prisma.promotions.findUnique({
            where: { id }
        });

        if (!promo) throw new NotFoundException('Không tìm thấy khuyến mãi');
        if (promo.created_by !== ownerId) throw new ForbiddenException('Bạn không có quyền chỉnh sửa');

        const newStatus = promo.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

        return this.prisma.promotions.update({
            where: { id },
            data: { status: newStatus as PromotionStatus }
        });
    }

    async deletePromotion(ownerId: string, id: string) {
        const promo = await this.prisma.promotions.findUnique({
            where: { id }
        });

        if (!promo) throw new NotFoundException('Không tìm thấy khuyến mãi');
        if (promo.created_by !== ownerId) throw new ForbiddenException('Bạn không có quyền xóa');

        return this.prisma.promotions.update({
            where: { id },
            data: { deleted_at: new Date() }
        });
    }

    async getPromotions(query: { page?: number; limit?: number; search?: string; status?: PromotionStatus }) {
        const { page = 1, limit = 10, search, status } = query;
        const skip = (page - 1) * limit;

        const where: any = {
            deleted_at: null,
            ...(status && { status }),
            ...(search && {
                OR: [
                    { code: { contains: search, mode: 'insensitive' } },
                    { name: { contains: search, mode: 'insensitive' } }
                ]
            })
        };

        const [data, total] = await Promise.all([
            this.prisma.promotions.findMany({
                where,
                skip,
                take: Number(limit),
                include: { creator: { select: { id: true, full_name: true } } },
                orderBy: { created_at: 'desc' }
            }),
            this.prisma.promotions.count({ where })
        ]);

        return {
            data,
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            }
        };
    }

    async adminCreatePromotion(adminId: string, data: any) {
        return this.createPromotion(adminId, data);
    }

    async adminUpdatePromotion(id: string, data: any) {
        const promo = await this.prisma.promotions.findUnique({ where: { id } });
        if (!promo) throw new NotFoundException('Không tìm thấy khuyến mãi');
        
        const { venue_ids, ...promoData } = data;

        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.promotions.update({
                where: { id },
                data: {
                    ...promoData,
                    code: data.code ? data.code.toUpperCase() : undefined,
                    discount_value: data.discount_value ? Number(data.discount_value) : undefined,
                    max_discount_amount: data.max_discount_amount !== undefined ? (data.max_discount_amount ? Number(data.max_discount_amount) : null) : undefined,
                    min_booking_amount: data.min_booking_amount ? Number(data.min_booking_amount) : undefined,
                    valid_from: data.valid_from ? new Date(data.valid_from) : undefined,
                    valid_to: data.valid_to ? new Date(data.valid_to) : undefined
                }
            });

            if (venue_ids) {
                await tx.promotion_venues.deleteMany({ where: { promotion_id: id } });
                if (venue_ids.length > 0) {
                    await tx.promotion_venues.createMany({
                        data: venue_ids.map(vId => ({
                            promotion_id: id,
                            venue_id: vId
                        }))
                    });
                }
            }
            return updated;
        });
    }

    async adminToggleStatus(id: string, status?: PromotionStatus) {
        const promo = await this.prisma.promotions.findUnique({ where: { id } });
        if (!promo) throw new NotFoundException('Không tìm thấy khuyến mãi');

        return this.prisma.promotions.update({
            where: { id },
            data: { status: status || (promo.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE') }
        });
    }

    async adminDeletePromotion(id: string) {
        const promo = await this.prisma.promotions.findUnique({ where: { id } });
        if (!promo) throw new NotFoundException('Không tìm thấy khuyến mãi');

        return this.prisma.promotions.update({
            where: { id },
            data: { deleted_at: new Date() }
        });
    }

    async getPublicPromotions(query: { page?: any; limit?: any; status?: PromotionStatus; is_public?: any }) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const status = query.status || 'ACTIVE';
        const is_public = query.is_public === 'true' || query.is_public === true || query.is_public === undefined;

        const skip = (page - 1) * limit;

        const where: any = {
            deleted_at: null,
            status,
            is_public,
            valid_from: { lte: new Date() },
            valid_to: { gte: new Date() }
        };

        const [data, total] = await Promise.all([
            this.prisma.promotions.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { created_at: 'desc' }
            }),
            this.prisma.promotions.count({ where })
        ]);

        return {
            data: data.map(p => ({
                ...p,
                discount_value: Number(p.discount_value),
                max_discount_amount: p.max_discount_amount ? Number(p.max_discount_amount) : null,
                min_booking_amount: p.min_booking_amount ? Number(p.min_booking_amount) : 0,
            })),
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            }
        };
    }

    async collectPromotion(userId: string, promotionId: string) {
        const promo = await this.prisma.promotions.findUnique({
            where: { id: promotionId }
        });

        if (!promo) throw new NotFoundException('Không tìm thấy khuyến mãi');
        if (promo.status !== 'ACTIVE') throw new BadRequestException('Khuyến mãi hiện không khả dụng');

        const existing = await this.prisma.user_vouchers.findFirst({
            where: { user_id: userId, promotion_id: promotionId }
        });

        if (existing) throw new BadRequestException('Bạn đã lưu khuyến mãi này rồi');

        return this.prisma.user_vouchers.create({
            data: {
                user_id: userId,
                promotion_id: promotionId,
                status: 'UNUSED'
            }
        });
    }

    async getMyVouchers(userId: string) {
        const vouchers = await this.prisma.user_vouchers.findMany({
            where: { user_id: userId },
            include: { promotions: true },
            orderBy: { created_at: 'desc' }
        });

        return vouchers.map(v => ({
            ...v,
            promotion: {
                ...v.promotions,
                discount_value: Number(v.promotions.discount_value),
                max_discount_amount: v.promotions.max_discount_amount ? Number(v.promotions.max_discount_amount) : null,
                min_booking_amount: Number(v.promotions.min_booking_amount),
            }
        }));
    }
}
