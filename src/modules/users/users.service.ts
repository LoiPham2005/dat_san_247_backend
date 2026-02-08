import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as argon2 from 'argon2';
import { UserFilterDto } from './dto/user-filter.dto';

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
    ) { }

    private mapUser(user: any) {
        if (!user) return null;
        const { roles, ...rest } = user;
        return {
            ...rest,
            id: user.id,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
            deletedAt: user.deleted_at,
            fullName: user.full_name,
            kycStatus: user.kyc_status,
            avatarUrl: user.avatar_url,
            isActive: user.is_active,
            isVerified: user.is_verified,
            dateOfBirth: user.date_of_birth,
            emailVerifiedAt: user.email_verified_at,
            phoneVerifiedAt: user.phone_verified_at,
            lastLoginAt: user.last_login_at,
            roleId: user.role_id,
            role: roles ? {
                ...roles,
                createdAt: roles.created_at,
                updatedAt: roles.updated_at,
                isSystem: roles.is_system,
                isActive: roles.is_active,
            } : undefined,
            // Map other relations if needed
        };
    }

    async findAll(filter: UserFilterDto) {
        const { page = 1, limit = 10, role, search, isActive } = filter;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (role) {
            where.roles = { slug: role };
        }

        if (search) {
            where.OR = [
                { full_name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (isActive !== undefined) {
            where.is_active = String(isActive) === 'true';
        }

        const [items, total] = await Promise.all([
            this.prisma.users.findMany({
                where,
                include: { roles: true },
                orderBy: { created_at: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.users.count({ where }),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            items: items.map(user => this.mapUser(user)),
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
        const user = await this.prisma.users.findUnique({
            where: { id },
            // relations: ['role', 'bookings', 'favoriteVenues']
            include: {
                roles: true,
                bookings: true,
                favorite_venues: true
            }
        });
        if (!user) throw new NotFoundException('User not found');
        return this.mapUser(user);
    }

    async findByEmail(email: string) {
        const user = await this.prisma.users.findUnique({
            where: { email },
            include: { roles: true },
        });
        return this.mapUser(user);
    }

    async findByPhone(phone: string) {
        const user = await this.prisma.users.findUnique({
            where: { phone },
            include: { roles: true },
        });
        return this.mapUser(user || null);
    }

    async create(data: any) {
        if (data.password) {
            data.password = await argon2.hash(data.password, { type: argon2.argon2id });
        }

        // Map camelCase DTO input to snake_case DB fields
        const createData: any = {
            email: data.email,
            password: data.password,
            full_name: data.fullName,
            phone: data.phone,
            role_id: data.role?.id || data.roleId, // handle relation assignment
            is_active: data.isActive,
            is_verified: data.isVerified,
            avatar_url: data.avatarUrl,
            // ... map other fields
        };

        const user = await this.prisma.users.create({
            data: createData,
            include: { roles: true }
        });
        return this.mapUser(user);
    }

    async update(id: string, data: any) {
        const updateData: any = {};

        if (data.password) {
            updateData.password = await argon2.hash(data.password, { type: argon2.argon2id });
        }
        if (data.fullName) updateData.full_name = data.fullName;
        if (data.phone) updateData.phone = data.phone;
        if (data.avatarUrl) updateData.avatar_url = data.avatarUrl;
        if (data.isActive !== undefined) updateData.is_active = data.isActive;
        if (data.isVerified !== undefined) updateData.is_verified = data.isVerified;
        // ... map others

        const user = await this.prisma.users.update({
            where: { id },
            data: updateData,
            include: { roles: true }
        });
        return this.mapUser(user);
    }

    async changePassword(id: string, data: any) {
        const user = await this.prisma.users.findUnique({
            where: { id },
        });

        if (!user) throw new NotFoundException('User not found');

        const isMatch = await argon2.verify(user.password, data.oldPassword);
        if (!isMatch) {
            throw new Error('Mật khẩu hiện tại không chính xác');
        }

        const hashedNewPassword = await argon2.hash(data.newPassword, { type: argon2.argon2id });
        await this.prisma.users.update({
            where: { id },
            data: { password: hashedNewPassword }
        });

        return { message: 'Đổi mật khẩu thành công' };
    }


    async toggleStatus(id: string) {
        const user = await this.findOne(id);
        const newStatus = !user.isActive;

        const updated = await this.prisma.users.update({
            where: { id },
            data: { is_active: newStatus },
            include: { roles: true }
        });
        return this.mapUser(updated);
    }

    async softDelete(id: string) {
        const user = await this.findOne(id);
        await this.prisma.users.update({
            where: { id },
            data: { deleted_at: new Date() } // Soft delete
        });
        return { success: true };
    }
}
