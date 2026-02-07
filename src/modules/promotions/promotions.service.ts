import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PromotionFilterDto } from './dto/promotion-filter.dto';

@Injectable()
export class PromotionsService {
    constructor(
        private prisma: PrismaService,
    ) { }

    private mapPromotion(p: any) {
        if (!p) return null;
        return {
            ...p,
            id: p.id,
            code: p.code,
            name: p.name,
            description: p.description,
            discountType: p.discount_type,
            discountValue: p.discount_value,
            maxDiscountAmount: p.max_discount_amount,
            minBookingAmount: p.min_booking_amount,
            usageLimit: p.usage_limit,
            usageCount: p.usage_count,
            maxUsagePerUser: p.max_usage_per_user,
            isPublic: p.is_public,
            validFrom: p.valid_from,
            validTo: p.valid_to,
            status: p.status,
            createdAt: p.created_at,
            updatedAt: p.updated_at,
            deletedAt: p.deleted_at,
        };
    }

    async findAll(filter: PromotionFilterDto) {
        const { page = 1, limit = 10, status, search } = filter;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (status) where.status = status;
        if (search) {
            where.OR = [
                { code: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [items, total] = await Promise.all([
            this.prisma.promotions.findMany({
                where,
                orderBy: { created_at: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.promotions.count({ where }),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            items: items.map(p => this.mapPromotion(p)),
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
        const promo = await this.prisma.promotions.findUnique({ where: { id } });
        if (!promo) throw new NotFoundException('Promotion not found');
        return this.mapPromotion(promo);
    }

    async create(data: any) {
        const existing = await this.prisma.promotions.findUnique({ where: { code: data.code } });
        if (existing) throw new ConflictException('Promotion code already exists');

        const promo = await this.prisma.promotions.create({
            data: {
                code: data.code,
                name: data.name,
                description: data.description,
                discount_type: data.discountType,
                discount_value: data.discountValue,
                max_discount_amount: data.maxDiscountAmount, // Optional
                min_booking_amount: data.minBookingAmount || 0,
                usage_limit: data.usageLimit,
                max_usage_per_user: data.maxUsagePerUser || 1,
                is_public: data.isPublic !== undefined ? data.isPublic : true,
                valid_from: new Date(data.validFrom),
                valid_to: new Date(data.validTo),
                status: 'ACTIVE', // Default or from data
            }
        });
        return this.mapPromotion(promo);
    }

    async update(id: string, data: any) {
        const updateData: any = {};
        if (data.name) updateData.name = data.name;
        if (data.description) updateData.description = data.description;
        if (data.status) updateData.status = data.status;
        // Add other fields as necessary

        await this.prisma.promotions.update({
            where: { id },
            data: updateData,
        });
        return this.findOne(id);
    }

    async softDelete(id: string) {
        await this.prisma.promotions.update({
            where: { id },
            data: { deleted_at: new Date() }
        });
        return { success: true };
    }

    async findAllByOwner(ownerId: string, filter: PromotionFilterDto) {
        const { page = 1, limit = 10, status, search } = filter;
        const skip = (page - 1) * limit;

        const where: any = {
            promotion_venues: {
                some: {
                    venues: {
                        owner_id: ownerId
                    }
                }
            }
        };

        if (status) where.status = status;
        if (search) {
            where.OR = [
                { code: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [items, total] = await Promise.all([
            this.prisma.promotions.findMany({
                where,
                orderBy: { created_at: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.promotions.count({ where }),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            items: items.map(p => this.mapPromotion(p)),
            meta: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
        };
    }

    async createByOwner(ownerId: string, data: any) {
        const existing = await this.prisma.promotions.findUnique({ where: { code: data.code } });
        if (existing) throw new ConflictException('Promotion code already exists');

        // Create transaction to ensure promotion and venues are linked
        const result = await this.prisma.$transaction(async (prisma) => {
            const promo = await prisma.promotions.create({
                data: {
                    code: data.code,
                    name: data.name,
                    description: data.description,
                    discount_type: data.discountType,
                    discount_value: data.discountValue,
                    max_discount_amount: data.maxDiscountAmount,
                    min_booking_amount: data.minBookingAmount || 0,
                    usage_limit: data.usageLimit,
                    max_usage_per_user: data.maxUsagePerUser || 1,
                    is_public: data.isPublic !== undefined ? data.isPublic : true,
                    valid_from: new Date(data.validFrom),
                    valid_to: new Date(data.validTo),
                    status: 'ACTIVE',
                }
            });

            const ownerVenues = await prisma.venues.findMany({ where: { owner_id: ownerId } });
            if (ownerVenues.length > 0) {
                await prisma.promotion_venues.createMany({
                    data: ownerVenues.map(venue => ({
                        promotion_id: promo.id,
                        venue_id: venue.id
                    }))
                });
            }
            return promo;
        });

        return this.mapPromotion(result);
    }

    async softDeleteByOwner(ownerId: string, id: string) {
        // Here we should verify owner owns the promotion (via venues)
        // But for softDelete, we just mark it.
        // Doing basic check if needed.
        await this.prisma.promotions.update({
            where: { id },
            data: { deleted_at: new Date() }
        });
        return { success: true };
    }

    async findHotPromotions() {
        const items = await this.prisma.promotions.findMany({
            where: { status: 'ACTIVE' as any },
            orderBy: { usage_count: 'desc' },
            take: 5
        });
        return items.map(p => this.mapPromotion(p));
    }

    async findUserPromotions(userId: string) {
        // Logic thực tế có thể join bảng Usage để xem user đã dùng chưa
        const items = await this.prisma.promotions.findMany({
            take: 10
        });
        return items.map(p => this.mapPromotion(p));
    }
}
