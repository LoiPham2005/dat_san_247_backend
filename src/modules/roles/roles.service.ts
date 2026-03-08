import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PermissionDto, SyncPermissionsDto, UpdateRolePermissionsDto } from './dto/sync-permissions.dto';

@Injectable()
export class RolesService {
    constructor(private prisma: PrismaService) { }

    /**
     * Đồng bộ danh sách permissions từ code vào database.
     * Thường dùng khi khởi động server hoặc qua Admin API.
     */
    async syncPermissions(dto: SyncPermissionsDto) {
        const { permissions } = dto;

        // upsert permissions — không xoá cũ, chỉ thêm mới hoặc cập nhật
        const results = await Promise.all(
            permissions.map(p => this.prisma.permissions.upsert({
                where: { slug: p.slug },
                update: {
                    resource: p.resource,
                    action: p.action,
                    description: p.description,
                    scope: p.scope || 'platform'
                },
                create: {
                    slug: p.slug,
                    resource: p.resource,
                    action: p.action,
                    description: p.description,
                    scope: p.scope || 'platform'
                }
            }))
        );

        return {
            count: results.length,
            message: 'Permissions synced successfully'
        };
    }

    /**
     * Lấy toàn bộ roles (Active only by default)
     */
    async findAllRoles() {
        return this.prisma.roles.findMany({
            where: { is_active: true },
            include: {
                role_permissions: {
                    include: { permissions: true }
                }
            }
        });
    }

    /**
     * Chi tiết 1 role + permissions của role đó
     */
    async findRoleBySlug(slug: string) {
        const role = await this.prisma.roles.findUnique({
            where: { slug },
            include: {
                role_permissions: {
                    include: { permissions: true }
                }
            }
        });
        if (!role) throw new NotFoundException('Role ' + slug + ' not found');
        return role;
    }

    /**
     * Tìm permissions của platform role_id
     */
    async findPermissionsByRoleId(roleId: string): Promise<string[]> {
        const rolePerms = await this.prisma.role_permissions.findMany({
            where: { role_id: roleId },
            include: { permissions: true }
        });

        return rolePerms.map(rp => rp.permissions.slug);
    }

    /**
     * Cập nhật danh sách permissions cho 1 role
     */
    async updateRolePermissions(roleId: string, dto: UpdateRolePermissionsDto) {
        // Xoá tất cả permissions cũ của role này
        await this.prisma.role_permissions.deleteMany({
            where: { role_id: roleId }
        });

        // Add permissions mới
        const results = await Promise.all(
            dto.permissionIds.map(pId => this.prisma.role_permissions.create({
                data: {
                    role_id: roleId,
                    permission_id: pId
                }
            }))
        );

        return {
            success: true,
            updatedCount: results.length
        };
    }

    /**
     * Lấy danh sách toàn bộ permissions có trong hệ thống
     */
    async findAllPermissions() {
        return this.prisma.permissions.findMany({
            orderBy: { resource: 'asc' }
        });
    }
}
