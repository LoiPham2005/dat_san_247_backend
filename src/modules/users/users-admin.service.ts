import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryUsersDto } from './dto/query-users.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import * as argon2 from 'argon2';

@Injectable()
export class UsersAdminService {
    constructor(private prisma: PrismaService) { }

    async create(dto: AdminCreateUserDto) {
        const existing = await this.prisma.users.findUnique({
            where: { email: dto.email }
        });
        if (existing) throw new ConflictException('Email đã tồn tại');

        const hashedPassword = await argon2.hash(dto.password);

        return this.prisma.users.create({
            data: {
                ...dto,
                password: hashedPassword,
                profile: { create: {} },
                wallet: { create: { balance: 0 } }
            },
            include: { role: true }
        });
    }

    async findMany(query: QueryUsersDto) {
        const { page = 1, limit = 10, search, status, role_id } = query;
        const skip = (page - 1) * limit;

        const where: any = {
            deleted_at: null,
            ...(status && { status }),
            ...(role_id && { role_id }),
            ...(search && {
                OR: [
                    { full_name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search } }
                ]
            })
        };

        const [items, total] = await Promise.all([
            this.prisma.users.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: { role: true }
            }),
            this.prisma.users.count({ where })
        ]);

        return { items, total };
    }

    async findById(id: string) {
        const user = await this.prisma.users.findUnique({
            where: { id },
            include: {
                role: true,
                profile: true,
                devices: true,
                wallet: true
            }
        });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async update(id: string, dto: AdminUpdateUserDto) {
        const user = await this.prisma.users.findUnique({ where: { id } });
        if (!user) throw new NotFoundException('User not found');

        return this.prisma.users.update({
            where: { id },
            data: dto,
            include: { role: true }
        });
    }

    async delete(id: string) {
        const user = await this.prisma.users.findUnique({ where: { id } });
        if (!user) throw new NotFoundException('User not found');

        return this.prisma.users.update({
            where: { id },
            data: { deleted_at: new Date() }
        });
    }
}
