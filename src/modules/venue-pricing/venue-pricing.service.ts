import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VenuePricing } from './entities/venue-pricing.entity';
import { CreateVenuePricingDto } from './dto/create-venue-pricing.dto';
import { UpdateVenuePricingDto } from './dto/update-venue-pricing.dto';
import { success } from 'src/common/helper/response.helper';

@Injectable()
export class VenuePricingService {
    constructor(
        @InjectRepository(VenuePricing)
        private readonly pricingRepo: Repository<VenuePricing>,
    ) { }

    async create(createDto: CreateVenuePricingDto) {
        const pricing = this.pricingRepo.create(createDto);
        const saved = await this.pricingRepo.save(pricing);
        return success(saved, 'Tạo mức giá thành công');
    }

    async findAll() {
        const pricings = await this.pricingRepo.find({ relations: ['venue'] });
        return success(pricings, 'Lấy danh sách mức giá thành công');
    }

    async findOne(pricingId: number) {
        const pricing = await this.pricingRepo.findOne({ where: { pricingId }, relations: ['venue'] });
        if (!pricing) throw new NotFoundException('Mức giá không tồn tại');
        return success(pricing, 'Lấy chi tiết mức giá thành công');
    }

    async findByVenue(venueId: number) {
        const pricings = await this.pricingRepo.find({ where: { venueId }, order: { startTime: 'ASC' } });
        return success(pricings, 'Lấy danh sách mức giá theo venue thành công');
    }

    async update(pricingId: number, updateDto: UpdateVenuePricingDto) {
        const pricing = await this.pricingRepo.findOne({ where: { pricingId } });
        if (!pricing) throw new NotFoundException('Mức giá không tồn tại');
        Object.assign(pricing, updateDto);
        const updated = await this.pricingRepo.save(pricing);
        return success(updated, 'Cập nhật mức giá thành công');
    }

    async remove(pricingId: number) {
        const pricing = await this.pricingRepo.findOne({ where: { pricingId } });
        if (!pricing) throw new NotFoundException('Mức giá không tồn tại');
        const removed = await this.pricingRepo.remove(pricing);
        return success(removed, 'Xóa mức giá thành công');
    }
}
