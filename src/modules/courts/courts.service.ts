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
            relations: ['pricingRules']
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
        const { venueId, pricingRules, ...courtData } = data;
        // Verify owner owns the venue
        await this.venuesService.findOneByOwner(ownerId, venueId);

        const court = this.courtRepository.create({ ...courtData, venueId } as any);
        const savedCourt = await this.courtRepository.save(court);

        if (pricingRules && Array.isArray(pricingRules)) {
            const rules = this.pricingRuleRepository.create(pricingRules.map(rule => ({
                ...rule,
                courtId: (savedCourt as any).id
            })));
            await this.pricingRuleRepository.save(rules);
        }

        return this.findOne((savedCourt as any).id);
    }

    async update(ownerId: string, id: string, data: any) {
        const { pricingRules, ...courtData } = data;
        const court = await this.findOne(id);
        if (court.venue.ownerId !== ownerId) {
            throw new ForbiddenException('You do not have permission to update this court');
        }

        Object.assign(court, courtData);
        await this.courtRepository.save(court);

        if (pricingRules && Array.isArray(pricingRules)) {
            await this.pricingRuleRepository.delete({ courtId: id });
            const rules = this.pricingRuleRepository.create(pricingRules.map(rule => ({
                ...rule,
                courtId: id
            })));
            await this.pricingRuleRepository.save(rules);
        }

        return this.findOne(id);
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
        console.log(`[CourtsService] Updating pricing rules for court ${courtId} by owner ${ownerId}`);
        const court = await this.findOne(courtId);
        if (court.venue.ownerId !== ownerId) {
            console.error(`[CourtsService] Forbidden: Owner ${ownerId} does not own venue for court ${courtId}`);
            throw new ForbiddenException('You do not have permission to update pricing rules for this court');
        }

        // Simple approach: delete old rules and create new ones
        console.log(`[CourtsService] Deleting ${court.pricingRules?.length || 0} old rules`);
        await this.pricingRuleRepository.delete({ courtId });

        console.log(`[CourtsService] Creating ${rules.length} new rules:`, JSON.stringify(rules, null, 2));
        const newRules = this.pricingRuleRepository.create(rules.map(rule => ({
            ...rule,
            courtId
        })));

        const savedRules = await this.pricingRuleRepository.save(newRules);
        console.log(`[CourtsService] Successfully saved ${savedRules.length} rules`);
        return savedRules;
    }
}
