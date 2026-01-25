import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import * as bcrypt from 'bcrypt';
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
            query.innerJoin('user.role', 'role')
                .andWhere('role.slug = :role', { role });
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
            relations: ['role', 'bookings', 'favoriteVenues']
        });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async findByEmail(email: string) {
        return this.userRepository.findOne({
            where: { email },
            select: ['id', 'email', 'password', 'fullName', 'isActive', 'isVerified', 'role'],
            relations: ['role'],
        });
    }

    async create(data: Partial<User>): Promise<User> {
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }
        const user = this.userRepository.create(data);
        return this.userRepository.save(user);
    }

    async update(id: string, data: any) {
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }
        await this.userRepository.update(id, data);
        return this.findOne(id);
    }

    async changePassword(id: string, data: any) {
        const user = await this.userRepository.findOne({
            where: { id },
            select: ['id', 'password']
        });

        if (!user) throw new NotFoundException('User not found');

        const isMatch = await bcrypt.compare(data.oldPassword, user.password);
        if (!isMatch) {
            throw new Error('Mật khẩu hiện tại không chính xác');
        }

        const hashedNewPassword = await bcrypt.hash(data.newPassword, 10);
        await this.userRepository.update(id, { password: hashedNewPassword });

        return { message: 'Đổi mật khẩu thành công' };
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
