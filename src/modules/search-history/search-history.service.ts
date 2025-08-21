import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchHistory } from './entities/search-history.entity';
import { CreateSearchHistoryDto } from './dto/create-search-history.dto';
import { UpdateSearchHistoryDto } from './dto/update-search-history.dto';
import { success } from 'src/common/helper/response.helper';

@Injectable()
export class SearchHistoryService {
    constructor(
        @InjectRepository(SearchHistory)
        private readonly repo: Repository<SearchHistory>,
    ) { }

    async create(createDto: CreateSearchHistoryDto) {
        const entity = this.repo.create(createDto);
        const saved = await this.repo.save(entity);
        return success(saved, 'Tạo lịch sử tìm kiếm thành công');
    }

    async findAll() {
        const histories = await this.repo.find({ order: { searchDate: 'DESC' } });
        return success(histories, 'Lấy danh sách lịch sử tìm kiếm thành công');
    }

    async findOne(searchId: number) {
        const history = await this.repo.findOne({ where: { searchId } });
        return success(history, 'Lấy chi tiết lịch sử tìm kiếm thành công');
    }

    async update(searchId: number, updateDto: UpdateSearchHistoryDto) {
        const result = await this.repo.update(searchId, updateDto);
        return success(result, 'Cập nhật lịch sử tìm kiếm thành công');
    }

    async remove(searchId: number) {
        const result = await this.repo.delete(searchId);
        return success(result, 'Xóa lịch sử tìm kiếm thành công');
    }
}
