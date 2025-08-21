import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscountUsage } from './entities/discount-usage.entity';
import { CreateDiscountUsageDto } from './dto/create-discount-usage.dto';
import { UpdateDiscountUsageDto } from './dto/update-discount-usage.dto';
import { success } from 'src/common/helper/response.helper';

@Injectable()
export class DiscountUsageService {
    constructor(
        @InjectRepository(DiscountUsage)
        private readonly usageRepo: Repository<DiscountUsage>,
    ) { }

    async create(createDto: CreateDiscountUsageDto) {
        const usage = this.usageRepo.create(createDto);
        const saved = await this.usageRepo.save(usage);
        return success(saved, 'Tạo bản ghi sử dụng mã giảm giá thành công');
    }

    async findAll() {
        const usages = await this.usageRepo.find({
            relations: ['discountCode', 'user', 'booking'],
        });
        return success(usages, 'Lấy danh sách sử dụng mã giảm giá thành công');
    }

    async findByUser(userId: number) {
        const usages = await this.usageRepo.find({
            where: { userId },
            relations: ['discountCode', 'booking'],
        });
        return success(usages, 'Lấy danh sách sử dụng mã giảm giá theo người dùng thành công');
    }

    async remove(usageId: number) {
        const result = await this.usageRepo.delete({ usageId });
        return success(result, 'Xóa bản ghi sử dụng mã giảm giá thành công');
    }
}
