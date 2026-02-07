import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PermissionsService } from '../permissions/permissions.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';

@Injectable()
export class RolesService {
    constructor(
        private prisma: PrismaService,
        private permissionsService: PermissionsService,
    ) { }

    // Helper to map Prisma result to Entity-like structure (camelCase)
    private mapToEntity(role: any) {
        if (!role) return null;
        const { role_permissions, created_at, updated_at, deleted_at, is_system, is_active, ...rest } = role;

        return {
            ...rest,
            createdAt: created_at,
            updatedAt: updated_at,
            deletedAt: deleted_at,
            isSystem: is_system,
            isActive: is_active,
            permissions: role_permissions?.map((rp: any) => ({
                ...rp.permissions,
                createdAt: rp.permissions.created_at,
                updatedAt: rp.permissions.updated_at,
            })) || []
        };
    }

    async findAll() {
        const roles = await this.prisma.roles.findMany({
            include: {
                role_permissions: {
                    include: { permissions: true }
                }
            },
            orderBy: { created_at: 'desc' },
        });
        return roles.map(role => this.mapToEntity(role));
    }

    async findOne(id: string) {
        const role = await this.prisma.roles.findUnique({
            where: { id },
            include: {
                role_permissions: {
                    include: { permissions: true }
                }
            },
        });

        if (!role) {
            throw new NotFoundException(`Role with ID "${id}" not found`);
        }
        return this.mapToEntity(role);
    }

    async findBySlug(slug: string) {
        const role = await this.prisma.roles.findUnique({
            where: { slug },
            include: {
                role_permissions: {
                    include: { permissions: true }
                }
            },
        });

        if (!role) {
            throw new NotFoundException(`Role with slug "${slug}" not found`);
        }
        return this.mapToEntity(role);
    }

    async create(createRoleDto: CreateRoleDto) {
        const existing = await this.prisma.roles.findUnique({
            where: { slug: createRoleDto.slug },
        });

        if (existing) {
            throw new ConflictException(`Role with slug "${createRoleDto.slug}" already exists`);
        }

        // Validate permissions
        if (createRoleDto.permissionIds && createRoleDto.permissionIds.length > 0) {
            const count = await this.prisma.permissions.count({
                where: { id: { in: createRoleDto.permissionIds } }
            });
            if (count !== createRoleDto.permissionIds.length) {
                throw new BadRequestException('Some permission IDs are invalid');
            }
        }

        const role = await this.prisma.roles.create({
            data: {
                name: createRoleDto.name,
                slug: createRoleDto.slug,
                description: createRoleDto.description,
                is_system: false,
                role_permissions: {
                    create: createRoleDto.permissionIds?.map(id => ({
                        permission_id: id
                    })) || []
                }
            },
            include: {
                role_permissions: {
                    include: { permissions: true }
                }
            }
        });

        return this.mapToEntity(role);
    }

    async update(id: string, updateRoleDto: UpdateRoleDto) {
        const currentRole = await this.prisma.roles.findUnique({ where: { id } });
        if (!currentRole) throw new NotFoundException(`Role with ID "${id}" not found`);

        if (currentRole.is_system) {
            throw new BadRequestException('Cannot modify system roles');
        }

        // Update basic info
        const data: any = {
            name: updateRoleDto.name,
            description: updateRoleDto.description,
            is_active: updateRoleDto.isActive
        };

        // Handle permissions update (transactional replacement)
        if (updateRoleDto.permissionIds) {
            const permissionIds = updateRoleDto.permissionIds;
            // First verify permissions exist
            const count = await this.prisma.permissions.count({
                where: { id: { in: permissionIds } }
            });
            if (count !== permissionIds.length) {
                throw new BadRequestException('Some permission IDs are invalid');
            }

            // Using transaction to replace permissions
            return await this.prisma.$transaction(async (tx) => {
                // 1. Delete existing relations
                await tx.role_permissions.deleteMany({
                    where: { role_id: id }
                });

                // 2. Update role and create new relations
                const updated = await tx.roles.update({
                    where: { id },
                    data: {
                        ...data,
                        role_permissions: {
                            create: permissionIds.map(pid => ({
                                permission_id: pid
                            }))
                        }
                    },
                    include: {
                        role_permissions: {
                            include: { permissions: true }
                        }
                    }
                });
                return this.mapToEntity(updated);
            });
        }

        // Normal update without permissions change
        const role = await this.prisma.roles.update({
            where: { id },
            data,
            include: {
                role_permissions: {
                    include: { permissions: true }
                }
            }
        });

        return this.mapToEntity(role);
    }

    async delete(id: string) {
        const role = await this.prisma.roles.findUnique({ where: { id } });
        if (!role) throw new NotFoundException(`Role with ID "${id}" not found`);

        if (role.is_system) {
            throw new BadRequestException('Cannot delete system roles');
        }

        // Check assigned users
        const usersCount = await this.prisma.users.count({
            where: { role_id: id }
        });

        if (usersCount > 0) {
            throw new BadRequestException(`Cannot delete role. It is assigned to ${usersCount} user(s)`);
        }

        // Delete (cascade should handle role_permissions but relying on Prisma relation actions)
        // Prisma schema usually doesn't cascade delete on M-N explicit automatically unless configured
        // But here role_permissions.role_id has onDelete: Cascade in schema!
        await this.prisma.roles.delete({
            where: { id }
        });
    }

    async getDefaultCustomerRole() {
        return this.findBySlug('customer');
    }
}
