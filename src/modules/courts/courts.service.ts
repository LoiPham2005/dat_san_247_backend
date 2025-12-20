// modules/courts/courts.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Court, CourtStatus } from './entities/court.entity';
import { PricingRule } from './entities/pricing-rule.entity';
import { Venue } from '../venues/entities/venue.entity';
import { CreateCourtDto, UpdateCourtDto } from './dto/create-court.dto';
import { CreatePricingRuleDto } from './dto/create-pricing-rule.dto';

@Injectable()
export class CourtsService {
  constructor(
    @InjectRepository(Court)
    private courtRepository: Repository<Court>,
    @InjectRepository(PricingRule)
    private pricingRuleRepository: Repository<PricingRule>,
    @InjectRepository(Venue)
    private venueRepository: Repository<Venue>,
  ) {}

  async create(ownerId: string, createCourtDto: CreateCourtDto): Promise<Court> {
    // Verify venue belongs to owner
    const venue = await this.venueRepository.findOne({
      where: { id: createCourtDto.venueId, ownerId },
    });

    if (!venue) {
      throw new ForbiddenException('You do not own this venue');
    }

    const court = this.courtRepository.create(createCourtDto);
    return this.courtRepository.save(court);
  }

  async findByVenue(venueId: string): Promise<Court[]> {
    return this.courtRepository.find({
      where: { venueId, status: CourtStatus.ACTIVE },
      relations: ['sportType', 'pricingRules'],
      order: { displayOrder: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Court> {
    const court = await this.courtRepository.findOne({
      where: { id },
      relations: ['venue', 'sportType', 'pricingRules'],
    });

    if (!court) {
      throw new NotFoundException('Court not found');
    }

    return court;
  }

  async update(id: string, ownerId: string, updateCourtDto: UpdateCourtDto): Promise<Court> {
    const court = await this.findOne(id);

    // Verify ownership
    const venue = await this.venueRepository.findOne({
      where: { id: court.venueId, ownerId },
    });

    if (!venue) {
      throw new ForbiddenException('You do not own this venue');
    }

    Object.assign(court, updateCourtDto);
    return this.courtRepository.save(court);
  }

  async delete(id: string, ownerId: string): Promise<void> {
    const court = await this.findOne(id);

    const venue = await this.venueRepository.findOne({
      where: { id: court.venueId, ownerId },
    });

    if (!venue) {
      throw new ForbiddenException('You do not own this venue');
    }

    await this.courtRepository.delete(id);
  }

  // Pricing Rules
  async createPricingRule(createPricingRuleDto: CreatePricingRuleDto): Promise<PricingRule> {
    const pricingRule = this.pricingRuleRepository.create(createPricingRuleDto);
    return this.pricingRuleRepository.save(pricingRule);
  }

  async getPricingRules(courtId: string): Promise<PricingRule[]> {
    return this.pricingRuleRepository.find({
      where: { courtId, isActive: true },
      order: { timeFrom: 'ASC' },
    });
  }

  async getApplicablePrice(
    courtId: string,
    date: Date,
    time: string,
  ): Promise<number> {
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const pricingRule = await this.pricingRuleRepository
      .createQueryBuilder('pricing')
      .where('pricing.court_id = :courtId', { courtId })
      .andWhere('pricing.is_active = true')
      .andWhere('pricing.time_from <= :time', { time })
      .andWhere('pricing.time_to > :time', { time })
      .andWhere('pricing.day_type = :dayType', {
        dayType: isWeekend ? 'weekend' : 'weekday',
      })
      .andWhere(
        '(pricing.valid_from IS NULL OR pricing.valid_from <= :date)',
        { date },
      )
      .andWhere(
        '(pricing.valid_to IS NULL OR pricing.valid_to >= :date)',
        { date },
      )
      .getOne();

    return pricingRule ? pricingRule.pricePerHour : 0;
  }
}