import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchHistory } from './entities/search-history.entity';
import { CreateSearchHistoryDto } from './dto/create-search-history.dto';
import { UpdateSearchHistoryDto } from './dto/update-search-history.dto';

@Injectable()
export class SearchHistoryService {
  constructor(
    @InjectRepository(SearchHistory)
    private readonly repo: Repository<SearchHistory>,
  ) {}

  create(createDto: CreateSearchHistoryDto) {
    const entity = this.repo.create(createDto);
    return this.repo.save(entity);
  }

  findAll() {
    return this.repo.find({ order: { searchDate: 'DESC' } });
  }

  findOne(searchId: number) {
    return this.repo.findOne({ where: { searchId } });
  }

  update(searchId: number, updateDto: UpdateSearchHistoryDto) {
    return this.repo.update(searchId, updateDto);
  }

  remove(searchId: number) {
    return this.repo.delete(searchId);
  }
}
