import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { PermissionsService } from '../permissions/permissions.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';

@Injectable()
export class RolesService {
    constructor(
        @InjectRepository(Role)
        private rolesRepository: Repository<Role>,
        private permissionsService: PermissionsService,
    ) { }

    async findAll(): Promise<Role[]> {
        return this.rolesRepository.find({
            relations: ['permissions'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Role> {
        const role = await this.rolesRepository.findOne({
            where: { id },
            relations: ['permissions'],
        });
        if (!role) {
            throw new NotFoundException(`Role with ID "${id}" not found`);
        }
        return role;
    }

    async findBySlug(slug: string): Promise<Role> {
        const role = await this.rolesRepository.findOne({
            where: { slug },
            relations: ['permissions'],
        });
        if (!role) {
            throw new NotFoundException(`Role with slug "${slug}" not found`);
        }
        return role;
    }

    async create(createRoleDto: CreateRoleDto): Promise<Role> {
        // Check if slug already exists
        const existing = await this.rolesRepository.findOne({
            where: { slug: createRoleDto.slug },
        });
        if (existing) {
            throw new ConflictException(`Role with slug "${createRoleDto.slug}" already exists`);
        }

        // Get permissions
        const permissions = await this.permissionsService.findByIds(createRoleDto.permissionIds);
        if (permissions.length !== createRoleDto.permissionIds.length) {
            throw new BadRequestException('Some permission IDs are invalid');
        }

        const role = this.rolesRepository.create({
            name: createRoleDto.name,
            slug: createRoleDto.slug,
            description: createRoleDto.description,
            permissions,
            isSystem: false, // Custom roles are never system roles
        });

        return this.rolesRepository.save(role);
    }

    async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
        const role = await this.findOne(id);

        // Prevent modification of system roles
        if (role.isSystem) {
            throw new BadRequestException('Cannot modify system roles');
        }

        if (updateRoleDto.permissionIds) {
            const permissions = await this.permissionsService.findByIds(updateRoleDto.permissionIds);
            if (permissions.length !== updateRoleDto.permissionIds.length) {
                throw new BadRequestException('Some permission IDs are invalid');
            }
            role.permissions = permissions;
        }

        if (updateRoleDto.name) role.name = updateRoleDto.name;
        if (updateRoleDto.description !== undefined) role.description = updateRoleDto.description;
        if (updateRoleDto.isActive !== undefined) role.isActive = updateRoleDto.isActive;

        return this.rolesRepository.save(role);
    }

    async delete(id: string): Promise<void> {
        const role = await this.findOne(id);

        if (role.isSystem) {
            throw new BadRequestException('Cannot delete system roles');
        }

        // Check if role is assigned to any users
        const usersCount = await this.rolesRepository
            .createQueryBuilder('role')
            .leftJoin('role.users', 'user')
            .where('role.id = :id', { id })
            .getCount();

        if (usersCount > 0) {
            throw new BadRequestException(`Cannot delete role. It is assigned to ${usersCount} user(s)`);
        }

        await this.rolesRepository.remove(role);
    }

    async getDefaultCustomerRole(): Promise<Role> {
        return this.findBySlug('customer');
    }
}
