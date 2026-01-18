import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Court } from './entities/court.entity';
import { VenuesService } from '../venues/venues.service';
import { PricingRule } from '../time-slots/entities/pricing-rule.entity';

@Injectable()
export class CourtsService {
    constructor(
        @InjectRepository(Court)
        private courtRepository: Repository<Court>,
        @InjectRepository(PricingRule)
        private pricingRuleRepository: Repository<PricingRule>,
        private venuesService: VenuesService,
    ) { }

    async findAllByVenue(venueId: string) {
        return this.courtRepository.find({
            where: { venueId, isActive: true },
            relations: ['images', 'pricingRules']
        });
    }

    async findOne(id: string) {
        const court = await this.courtRepository.findOne({
            where: { id },
            relations: ['venue', 'pricingRules']
        });
        if (!court) throw new NotFoundException('Court not found');
        return court;
    }

    async create(ownerId: string, data: any) {
        const { venueId } = data;
        // Verify owner owns the venue
        await this.venuesService.findOneByOwner(ownerId, venueId);

        const court = this.courtRepository.create(data);
        return this.courtRepository.save(court);
    }

    async update(ownerId: string, id: string, data: any) {
        const court = await this.findOne(id);
        if (court.venue.ownerId !== ownerId) {
            throw new ForbiddenException('You do not have permission to update this court');
        }

        Object.assign(court, data);
        return this.courtRepository.save(court);
    }

    async softDelete(ownerId: string, id: string) {
        const court = await this.findOne(id);
        if (court.venue.ownerId !== ownerId) {
            throw new ForbiddenException('You do not have permission to delete this court');
        }

        return this.courtRepository.softRemove(court);
    }

    async getPricingRules(courtId: string) {
        return this.pricingRuleRepository.find({
            where: { courtId, isActive: true },
            order: { dayOfWeek: 'ASC', startTime: 'ASC' }
        });
    }

    async updatePricingRules(ownerId: string, courtId: string, rules: any[]) {
        const court = await this.findOne(courtId);
        if (court.venue.ownerId !== ownerId) {
            throw new ForbiddenException('You do not have permission to update pricing rules for this court');
        }

        // Simple approach: delete old rules and create new ones
        await this.pricingRuleRepository.delete({ courtId });

        const newRules = this.pricingRuleRepository.create(rules.map(rule => ({
            ...rule,
            courtId
        })));

        return this.pricingRuleRepository.save(newRules);
    }
}
