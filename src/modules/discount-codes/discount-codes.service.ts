import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscountCode } from './entities/discount-code.entity';
import { CreateDiscountCodeDto } from './dto/create-discount-code.dto';
import { UpdateDiscountCodeDto } from './dto/update-discount-code.dto';

@Injectable()
export class DiscountCodesService {
  constructor(
    @InjectRepository(DiscountCode)
    private readonly discountRepo: Repository<DiscountCode>,
  ) {}

  create(createDto: CreateDiscountCodeDto) {
    const discount = this.discountRepo.create(createDto);
    return this.discountRepo.save(discount);
  }

  findAll() {
    return this.discountRepo.find({ relations: ['creator'], order: { createdAt: 'DESC' } });
  }

  findOne(codeId: number) {
    return this.discountRepo.findOne({ where: { codeId }, relations: ['creator'] });
  }

  update(codeId: number, updateDto: UpdateDiscountCodeDto) {
    return this.discountRepo.update({ codeId }, updateDto);
  }

  remove(codeId: number) {
    return this.discountRepo.delete({ codeId });
  }
}
