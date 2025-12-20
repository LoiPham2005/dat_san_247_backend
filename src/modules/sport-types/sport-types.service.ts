import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SportType } from './entities/sport-type.entity';

@Injectable()
export class SportTypesService {
    constructor(
        @InjectRepository(SportType)
        private sportTypeRepository: Repository<SportType>,
    ) { }

    async findAll(): Promise<SportType[]> {
        return this.sportTypeRepository.find({
            where: { isActive: true },
            order: { displayOrder: 'ASC' },
        });
    }

    async findBySlug(slug: string): Promise<SportType | null> {
        return this.sportTypeRepository.findOne({ where: { slug } });
    }

    async create(data: Partial<SportType>): Promise<SportType> {
        const sportType = this.sportTypeRepository.create(data);
        return this.sportTypeRepository.save(sportType);
    }
}
