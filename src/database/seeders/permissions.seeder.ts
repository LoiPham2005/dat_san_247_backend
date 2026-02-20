import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { logger } from '@sentry/nestjs';

@Injectable()
export class PermissionsSeeder {
    constructor(private prisma: PrismaService) { }

    async seed() {
        const permissions = [
            // Users
            { resource: 'users', action: 'create', slug: 'users:create', description: 'Create new users' },
            { resource: 'users', action: 'read', slug: 'users:read', description: 'View users' },
            { resource: 'users', action: 'update', slug: 'users:update', description: 'Update users' },
            { resource: 'users', action: 'delete', slug: 'users:delete', description: 'Delete users' },

            // Venues
            { resource: 'venues', action: 'create', slug: 'venues:create', description: 'Create venues' },
            { resource: 'venues', action: 'read', slug: 'venues:read', description: 'View venues' },
            { resource: 'venues', action: 'update', slug: 'venues:update', description: 'Update venues' },
            { resource: 'venues', action: 'delete', slug: 'venues:delete', description: 'Delete venues' },
            { resource: 'venues', action: 'manage', slug: 'venues:manage', description: 'Full venue management' },
            { resource: 'venues', action: 'verify', slug: 'venues:verify', description: 'Verify new venues (Admin only)' },

            // Courts
            { resource: 'courts', action: 'create', slug: 'courts:create', description: 'Create courts' },
            { resource: 'courts', action: 'read', slug: 'courts:read', description: 'View courts' },
            { resource: 'courts', action: 'update', slug: 'courts:update', description: 'Update courts' },
            { resource: 'courts', action: 'delete', slug: 'courts:delete', description: 'Delete courts' },

            // Bookings
            { resource: 'bookings', action: 'create', slug: 'bookings:create', description: 'Create bookings' },
            { resource: 'bookings', action: 'read', slug: 'bookings:read', description: 'View all bookings' },
            { resource: 'bookings', action: 'read-own', slug: 'bookings:read-own', description: 'View own bookings' },
            { resource: 'bookings', action: 'update', slug: 'bookings:update', description: 'Update bookings' },
            { resource: 'bookings', action: 'delete', slug: 'bookings:delete', description: 'Delete bookings' },
            { resource: 'bookings', action: 'check-in', slug: 'bookings:check-in', description: 'Check-in customers' },

            // Payments
            { resource: 'payments', action: 'read', slug: 'payments:read', description: 'View payments' },
            { resource: 'payments', action: 'process', slug: 'payments:process', description: 'Process payments' },

            // Reviews
            { resource: 'reviews', action: 'create', slug: 'reviews:create', description: 'Create reviews' },
            { resource: 'reviews', action: 'read', slug: 'reviews:read', description: 'View reviews' },
            { resource: 'reviews', action: 'delete', slug: 'reviews:delete', description: 'Delete reviews' },
            { resource: 'reviews', action: 'reply', slug: 'reviews:reply', description: 'Reply to customer reviews' },

            // Analytics
            { resource: 'analytics', action: 'view', slug: 'analytics:view', description: 'View analytics' },

            // Roles & Permissions
            { resource: 'roles', action: 'create', slug: 'roles:create', description: 'Create roles' },
            { resource: 'roles', action: 'read', slug: 'roles:read', description: 'View roles' },
            { resource: 'roles', action: 'update', slug: 'roles:update', description: 'Update roles' },
            { resource: 'roles', action: 'delete', slug: 'roles:delete', description: 'Delete roles' },
            { resource: 'settings', action: 'manage', slug: 'settings:manage', description: 'Manage system settings' },
            { resource: 'promotions', action: 'manage', slug: 'promotions:manage', description: 'Manage marketing promotions' },

            // Wildcard (Super Admin)
            { resource: '*', action: '*', slug: '*', description: 'All permissions (Super Admin)' },
        ];

        let seededCount = 0;
        for (const p of permissions) {
            const existing = await this.prisma.permissions.findUnique({ where: { slug: p.slug } });
            if (!existing) {
                await this.prisma.permissions.create({ data: p });
                seededCount++;
            }
        }

        if (seededCount > 0) {
            logger.info(`✅ Seeded ${seededCount} new permissions`);
        } else {
            logger.info('✅ Permissions already up to date');
        }
    }
}

