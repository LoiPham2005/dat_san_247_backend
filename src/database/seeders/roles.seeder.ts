import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { logger } from '@sentry/nestjs';

@Injectable()
export class RolesSeeder {
    constructor(private prisma: PrismaService) { }

    async seed() {
        const allPermissions = await this.prisma.permissions.findMany();
        const permissionMap = new Map(allPermissions.map((p) => [p.slug, p]));

        const roles = [
            {
                name: 'Super Admin',
                slug: 'super-admin',
                description: 'Full system access',
                is_system: true,
                permissionSlugs: ['*'],
            },
            {
                name: 'Admin',
                slug: 'admin',
                description: 'Partial system administrative access',
                is_system: true,
                permissionSlugs: [
                    'users:read',
                    'users:update',
                    'venues:read',
                    'venues:verify',
                    'bookings:read',
                    'analytics:view',
                    'settings:manage',
                ],
            },
            {
                name: 'Staff',
                slug: 'staff',
                description: 'System staff with limited administrative access',
                is_system: true,
                permissionSlugs: [
                    'users:read',
                    'venues:read',
                    'bookings:read',
                ],
            },
            {
                name: 'Venue Owner',
                slug: 'owner',
                description: 'Manage own venues and staff',
                is_system: true,
                permissionSlugs: [
                    'venues:manage',
                    'courts:create',
                    'courts:read',
                    'courts:update',
                    'courts:delete',
                    'bookings:read',
                    'bookings:update',
                    'analytics:view',
                    'users:read',
                ],
            },
            {
                name: 'Venue Staff',
                slug: 'venue-staff',
                description: 'Check-in customers and view bookings for a specific venue',
                is_system: true,
                permissionSlugs: [
                    'bookings:read',
                    'bookings:check-in',
                    'courts:read',
                ],
            },
            {
                name: 'Customer',
                slug: 'customer',
                description: 'Book venues and write reviews',
                is_system: true,
                permissionSlugs: [
                    'bookings:create',
                    'bookings:read-own',
                    'reviews:create',
                    'venues:read',
                ],
            },
        ];

        let seededCount = 0;
        for (const roleData of roles) {
            const existing = await this.prisma.roles.findUnique({ where: { slug: roleData.slug } });
            if (!existing) {
                const { permissionSlugs, ...rest } = roleData;

                await this.prisma.roles.create({
                    data: {
                        ...rest,
                        role_permissions: {
                            create: permissionSlugs
                                .map(slug => permissionMap.get(slug))
                                .filter(p => p !== undefined)
                                .map(p => ({
                                    permission_id: p!.id
                                }))
                        }
                    }
                });
                seededCount++;
            }
        }

        if (seededCount > 0) {
            logger.info(`✅ Seeded ${seededCount} new roles`);
        } else {
            logger.info('✅ Roles already up to date');
        }
    }
}

