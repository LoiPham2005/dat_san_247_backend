import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscountCode } from './entities/discount-code.entity';
import { CreateDiscountCodeDto } from './dto/create-discount-code.dto';
import { UpdateDiscountCodeDto } from './dto/update-discount-code.dto';
import { success } from 'src/common/helper/response.helper';

@Injectable()
export class DiscountCodesService {
    constructor(
        @InjectRepository(DiscountCode)
        private readonly discountRepo: Repository<DiscountCode>,
    ) { }

    async create(createDto: CreateDiscountCodeDto) {
        const discount = this.discountRepo.create(createDto);
        const saved = await this.discountRepo.save(discount);
        return success(saved, 'Tạo mã giảm giá thành công');
    }

    async findAll() {
        const discounts = await this.discountRepo.find({
            relations: ['creator'],
            order: { createdAt: 'DESC' },
        });
        return success(discounts, 'Lấy danh sách mã giảm giá thành công');
    }

    async findOne(codeId: number) {
        const discount = await this.discountRepo.findOne({
            where: { codeId },
            relations: ['creator'],
        });
        return success(discount, 'Lấy chi tiết mã giảm giá thành công');
    }

    async update(codeId: number, updateDto: UpdateDiscountCodeDto) {
        const result = await this.discountRepo.update({ codeId }, updateDto);
        return success(result, 'Cập nhật mã giảm giá thành công');
    }

    async remove(codeId: number) {
        const result = await this.discountRepo.delete({ codeId });
        return success(result, 'Xóa mã giảm giá thành công');
    }
}
