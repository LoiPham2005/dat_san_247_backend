import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VenueStatistic } from './entities/venue-statistic.entity';
import { CreateVenueStatisticDto } from './dto/create-venue-statistic.dto';
import { UpdateVenueStatisticDto } from './dto/update-venue-statistic.dto';
import { success } from 'src/common/helper/response.helper';

@Injectable()
export class VenueStatisticsService {
    constructor(
        @InjectRepository(VenueStatistic)
        private readonly repo: Repository<VenueStatistic>,
    ) { }

    async create(createDto: CreateVenueStatisticDto) {
        const entity = this.repo.create(createDto);
        const saved = await this.repo.save(entity);
        return success(saved, 'Tạo thống kê venue thành công');
    }

    async findAll() {
        const stats = await this.repo.find({ order: { date: 'DESC' } });
        return success(stats, 'Lấy danh sách thống kê venue thành công');
    }

    async findOne(statId: number) {
        const stat = await this.repo.findOne({ where: { statId } });
        if (!stat) throw new NotFoundException('Thống kê venue không tồn tại');
        return success(stat, 'Lấy chi tiết thống kê venue thành công');
    }

    async update(statId: number, updateDto: UpdateVenueStatisticDto) {
        const stat = await this.repo.findOne({ where: { statId } });
        if (!stat) throw new NotFoundException('Thống kê venue không tồn tại');
        Object.assign(stat, updateDto);
        const updated = await this.repo.save(stat);
        return success(updated, 'Cập nhật thống kê venue thành công');
    }

    async remove(statId: number) {
        const stat = await this.repo.findOne({ where: { statId } });
        if (!stat) throw new NotFoundException('Thống kê venue không tồn tại');
        const removed = await this.repo.remove(stat);
        return success(removed, 'Xóa thống kê venue thành công');
    }
}
