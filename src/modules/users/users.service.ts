import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    private mapUser(user: any) {
        if (!user) return null;
        const { password, role, ...rest } = user;
        return {
            ...rest,
            role: role ? {
                id: role.id,
                name: role.name,
                slug: role.slug
            } : undefined,
            fullName: user.full_name,
            avatarUrl: user.avatar_url,
            isActive: user.status === 'ACTIVE',
            createdAt: user.created_at,
            updatedAt: user.updated_at,
        };
    }

    async findAll(filter?: any) {
        const users = await this.prisma.users.findMany({
            include: { role: true } as any
        });
        return users.map(u => this.mapUser(u));
    }

    async findById(id: string) {
        const user = await this.prisma.users.findUnique({
            where: { id },
            include: { role: true } as any
        });
        if (!user) throw new NotFoundException('User not found');
        return this.mapUser(user);
    }

    // Alias for findById to match controllers
    async findOne(id: string) {
        return this.findById(id);
    }

    async findByEmail(email: string) {
        const user = await this.prisma.users.findUnique({
            where: { email },
            include: { role: true } as any
        });
        return this.mapUser(user);
    }

    async findByPhone(phone: string) {
        const user = await this.prisma.users.findFirst({
            where: { phone },
            include: { role: true } as any
        });
        return this.mapUser(user);
    }

    async create(dto: CreateUserDto) {
        const existing = await this.findByEmail(dto.email);
        if (existing) throw new ConflictException('Email already exists');

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.users.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                full_name: dto.fullName,
                phone: dto.phone,
                role_id: dto.roleId,
                status: 'ACTIVE',
                avatar_url: dto.avatarUrl,
                is_email_verified: dto.isVerified || false,
                email_verified_at: dto.isVerified ? new Date() : null,
            },
            include: { role: true } as any
        });

        return this.mapUser(user);
    }

    async update(id: string, dto: UpdateUserDto) {
        const data: any = {};
        if (dto.fullName) data.full_name = dto.fullName;
        if (dto.phone) data.phone = dto.phone;
        if (dto.avatarUrl) data.avatar_url = dto.avatarUrl;
        if (dto.status) data.status = dto.status;

        const updated = await this.prisma.users.update({
            where: { id },
            data,
            include: { role: true } as any
        });

        return this.mapUser(updated);
    }

    async toggleStatus(id: string) {
        const user = await this.findById(id);
        const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        return this.prisma.users.update({
            where: { id },
            data: { status: newStatus },
            include: { role: true } as any
        });
    }

    async softDelete(id: string) {
        return this.prisma.users.update({
            where: { id },
            data: { deleted_at: new Date(), status: 'INACTIVE' }
        });
    }

    async restore(id: string) {
        return this.prisma.users.update({
            where: { id },
            data: { deleted_at: null, status: 'ACTIVE' }
        });
    }

    async changePassword(id: string, data: any) {
        const user = await this.prisma.users.findUnique({ where: { id } });
        if (!user) throw new NotFoundException('User not found');

        const isMatch = await bcrypt.compare(data.oldPassword, user.password);
        if (!isMatch) throw new ConflictException('Old password incorrect');

        const hashedPassword = await bcrypt.hash(data.newPassword, 10);
        await this.prisma.users.update({
            where: { id },
            data: { password: hashedPassword }
        });
        return { success: true };
    }
}
