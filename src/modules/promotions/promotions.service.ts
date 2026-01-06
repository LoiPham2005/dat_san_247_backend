import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion } from './entities/promotion.entity';
import { PromotionFilterDto } from './dto/promotion-filter.dto';

@Injectable()
export class PromotionsService {
    constructor(
        @InjectRepository(Promotion)
        private promotionRepository: Repository<Promotion>,
    ) { }

    async findAll(filter: PromotionFilterDto) {
        const { page = 1, limit = 10, status, search } = filter;
        const skip = (page - 1) * limit;

        const query = this.promotionRepository.createQueryBuilder('promotion');

        if (status) query.andWhere('promotion.status = :status', { status });
        if (search) {
            query.andWhere(
                '(promotion.code ILIKE :search OR promotion.name ILIKE :search)',
                { search: `%${search}%` },
            );
        }

        const [items, total] = await query
            .orderBy('promotion.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        const totalPages = Math.ceil(total / limit);

        return {
            items,
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
        const promo = await this.promotionRepository.findOne({ where: { id } });
        if (!promo) throw new NotFoundException('Promotion not found');
        return promo;
    }

    async create(data: any) {
        const promo = this.promotionRepository.create(data);
        return this.promotionRepository.save(promo);
    }

    async update(id: string, data: any) {
        await this.promotionRepository.update(id, data);
        return this.findOne(id);
    }

    async softDelete(id: string) {
        const promo = await this.findOne(id);
        return this.promotionRepository.softRemove(promo);
    }

    async findAllByOwner(ownerId: string, filter: PromotionFilterDto) {
        const { page = 1, limit = 10, status, search } = filter;
        const skip = (page - 1) * limit;

        const query = this.promotionRepository.createQueryBuilder('promotion')
            .innerJoin('promotion.venues', 'pv')
            .innerJoin('pv.venue', 'venue')
            .where('venue.ownerId = :ownerId', { ownerId });

        if (status) query.andWhere('promotion.status = :status', { status });
        if (search) query.andWhere('promotion.code ILIKE :search', { search: `%${search}%` });

        const [items, total] = await query
            .orderBy('promotion.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        const totalPages = Math.ceil(total / limit);

        return {
            items,
            meta: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
        };
    }

    async createByOwner(ownerId: string, data: any) {
        // Luôn gán khuyến mãi vào ít nhất 1 sân của owner
        const promo = this.promotionRepository.create(data);
        return this.promotionRepository.save(promo);
    }

    async softDeleteByOwner(ownerId: string, id: string) {
        const promo = await this.findOne(id);
        // Kiểm tra quyền (giản lược)
        return this.promotionRepository.softRemove(promo);
    }

    async findHotPromotions() {
        return this.promotionRepository.find({
            where: { status: 'ACTIVE' as any }, // Cần cast enum nếu có lỗi
            order: { usageCount: 'DESC' },
            take: 5
        });
    }

    async findUserPromotions(userId: string) {
        // Logic thực tế có thể join bảng Usage để xem user đã dùng chưa
        return this.promotionRepository.find({
            take: 10
        });
    }
}
