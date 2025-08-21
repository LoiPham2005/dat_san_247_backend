import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VenuePricing } from './entities/venue-pricing.entity';
import { CreateVenuePricingDto } from './dto/create-venue-pricing.dto';
import { UpdateVenuePricingDto } from './dto/update-venue-pricing.dto';

@Injectable()
export class VenuePricingService {
  constructor(
    @InjectRepository(VenuePricing)
    private readonly pricingRepo: Repository<VenuePricing>,
  ) {}

  create(createDto: CreateVenuePricingDto) {
    const pricing = this.pricingRepo.create(createDto);
    return this.pricingRepo.save(pricing);
  }

  findAll() {
    return this.pricingRepo.find({ relations: ['venue'] });
  }

  findOne(pricingId: number) {
    return this.pricingRepo.findOne({ where: { pricingId }, relations: ['venue'] });
  }

  findByVenue(venueId: number) {
    return this.pricingRepo.find({ where: { venueId }, order: { startTime: 'ASC' } });
  }

  update(pricingId: number, updateDto: UpdateVenuePricingDto) {
    return this.pricingRepo.update({ pricingId }, updateDto);
  }

  remove(pricingId: number) {
    return this.pricingRepo.delete({ pricingId });
  }
}
