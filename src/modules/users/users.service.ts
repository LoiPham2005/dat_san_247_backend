import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from './entities/user.entity';
import { UserFilterDto } from './dto/user-filter.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async findAll(filter: UserFilterDto) {
        const { page = 1, limit = 10, role, search, isActive } = filter;
        const skip = (page - 1) * limit;

        const query = this.userRepository.createQueryBuilder('user');

        if (role) {
            query.andWhere('user.role = :role', { role });
        }

        if (search) {
            query.andWhere(
                '(user.fullName ILIKE :search OR user.email ILIKE :search OR user.phone ILIKE :search)',
                { search: `%${search}%` },
            );
        }

        if (isActive !== undefined) {
            query.andWhere('user.isActive = :isActive', { isActive: isActive === 'true' });
        }

        const [items, total] = await query
            .orderBy('user.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        const totalPages = Math.ceil(total / limit);

        return {
            items,
            meta: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        };
    }

    async findOne(id: string) {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['bookings', 'favoriteVenues']
        });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async create(data: any) {
        const user = this.userRepository.create(data);
        return this.userRepository.save(user);
    }

    async update(id: string, data: any) {
        await this.userRepository.update(id, data);
        return this.findOne(id);
    }

    async toggleStatus(id: string) {
        const user = await this.findOne(id);
        user.isActive = !user.isActive;
        return this.userRepository.save(user);
    }

    async softDelete(id: string) {
        const user = await this.findOne(id);
        return this.userRepository.softRemove(user);
    }
}
