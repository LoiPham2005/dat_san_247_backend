import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ROLE_PERMISSIONS, UserRole } from '../../common/constants/role.constant';

@Injectable()
export class PermissionsSeeder {
    private readonly logger = new Logger(PermissionsSeeder.name);

    constructor(private readonly prisma: PrismaService) { }

    async seed() {
        // 1. Collect all unique permission slugs
        const allPermissionSlugs = new Set<string>();
        Object.values(ROLE_PERMISSIONS).forEach((perms) => {
            perms.forEach((p) => {
                if (p !== '*') allPermissionSlugs.add(p);
            });
        });

        // 2. Create permissions
        for (const slug of allPermissionSlugs) {
            const [resource, action] = slug.split(':');
            await this.prisma.permissions.upsert({
                where: { slug },
                update: {},
                create: {
                    slug,
                    resource,
                    action,
                    description: `Can ${action} ${resource}`,
                    scope: resource === 'venue-staff' || resource === 'courts' ? 'venue' : 'platform',
                },
            });
        }

        // 3. Assign permissions to roles
        for (const [roleSlug, permissionSlugs] of Object.entries(ROLE_PERMISSIONS)) {
            const role = await this.prisma.roles.findUnique({ where: { slug: roleSlug } });
            if (!role) continue;

            if (permissionSlugs.includes('*')) {
                // Assign all permissions to Super Admin / Admin
                const allPerms = await this.prisma.permissions.findMany();
                for (const p of allPerms) {
                    await this.assignPermission(role.id, p.id);
                }
            } else {
                for (const slug of permissionSlugs) {
                    const perm = await this.prisma.permissions.findUnique({ where: { slug } });
                    if (perm) {
                        await this.assignPermission(role.id, perm.id);
                    }
                }
            }
        }

        this.logger.log('Permissions and Role-Permissions seeded successfully');
    }

    private async assignPermission(roleId: string, permissionId: string) {
        await this.prisma.role_permissions.upsert({
            where: {
                role_id_permission_id: {
                    role_id: roleId,
                    permission_id: permissionId,
                },
            },
            update: {},
            create: {
                role_id: roleId,
                permission_id: permissionId,
            },
        });
    }
}
