import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VenueStatistic } from './entities/venue-statistic.entity';
import { CreateVenueStatisticDto } from './dto/create-venue-statistic.dto';
import { UpdateVenueStatisticDto } from './dto/update-venue-statistic.dto';

@Injectable()
export class VenueStatisticsService {
  constructor(
    @InjectRepository(VenueStatistic)
    private readonly repo: Repository<VenueStatistic>,
  ) {}

  create(createDto: CreateVenueStatisticDto) {
    const entity = this.repo.create(createDto);
    return this.repo.save(entity);
  }

  findAll() {
    return this.repo.find({ order: { date: 'DESC' } });
  }

  findOne(statId: number) {
    return this.repo.findOne({ where: { statId } });
  }

  update(statId: number, updateDto: UpdateVenueStatisticDto) {
    return this.repo.update(statId, updateDto);
  }

  remove(statId: number) {
    return this.repo.delete(statId);
  }
}
