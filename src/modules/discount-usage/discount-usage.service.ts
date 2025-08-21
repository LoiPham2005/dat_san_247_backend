import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscountUsage } from './entities/discount-usage.entity';
import { CreateDiscountUsageDto } from './dto/create-discount-usage.dto';
import { UpdateDiscountUsageDto } from './dto/update-discount-usage.dto';

@Injectable()
export class DiscountUsageService {
  constructor(
    @InjectRepository(DiscountUsage)
    private readonly usageRepo: Repository<DiscountUsage>,
  ) {}

  create(createDto: CreateDiscountUsageDto) {
    const usage = this.usageRepo.create(createDto);
    return this.usageRepo.save(usage);
  }

  findAll() {
    return this.usageRepo.find({ relations: ['discountCode', 'user', 'booking'] });
  }

  findByUser(userId: number) {
    return this.usageRepo.find({ where: { userId }, relations: ['discountCode', 'booking'] });
  }

  remove(usageId: number) {
    return this.usageRepo.delete({ usageId });
  }
}
