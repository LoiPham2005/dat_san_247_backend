import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../modules/roles/entities/role.entity';
import { Permission } from '../../modules/permissions/entities/permission.entity';
import { logger } from '@sentry/nestjs';

@Injectable()
export class RolesSeeder {
    constructor(
        @InjectRepository(Role)
        private rolesRepository: Repository<Role>,
        @InjectRepository(Permission)
        private permissionsRepository: Repository<Permission>,
    ) { }

    async seed() {
        const allPermissions = await this.permissionsRepository.find();
        const permissionMap = new Map(allPermissions.map((p) => [p.slug, p]));

        const roles = [
            {
                name: 'Super Admin',
                slug: 'super-admin',
                description: 'Full system access',
                isSystem: true,
                permissions: [permissionMap.get('*')].filter((p): p is Permission => p !== undefined),
            },
            {
                name: 'Admin',
                slug: 'admin',
                description: 'Partial system administrative access',
                isSystem: true,
                permissions: [
                    'users:read',
                    'users:update',
                    'venues:read',
                    'venues:verify',
                    'bookings:read',
                    'analytics:view',
                    'settings:manage',
                ].map((slug) => permissionMap.get(slug)).filter((p): p is Permission => p !== undefined),
            },
            {
                name: 'Staff',
                slug: 'staff',
                description: 'System staff with limited administrative access',
                isSystem: true,
                permissions: [
                    'users:read',
                    'venues:read',
                    'bookings:read',
                ].map((slug) => permissionMap.get(slug)).filter((p): p is Permission => p !== undefined),
            },
            {
                name: 'Venue Owner',
                slug: 'owner',
                description: 'Manage own venues and staff',
                isSystem: true,
                permissions: [
                    'venues:manage',
                    'courts:create',
                    'courts:read',
                    'courts:update',
                    'courts:delete',
                    'bookings:read',
                    'bookings:update',
                    'analytics:view',
                    'users:read',
                ].map((slug) => permissionMap.get(slug)).filter((p): p is Permission => p !== undefined),
            },
            {
                name: 'Venue Staff',
                slug: 'venue-staff',
                description: 'Check-in customers and view bookings for a specific venue',
                isSystem: true,
                permissions: [
                    'bookings:read',
                    'bookings:check-in',
                    'courts:read',
                ].map((slug) => permissionMap.get(slug)).filter((p): p is Permission => p !== undefined),
            },
            {
                name: 'Customer',
                slug: 'customer',
                description: 'Book venues and write reviews',
                isSystem: true,
                permissions: [
                    'bookings:create',
                    'bookings:read-own',
                    'reviews:create',
                    'venues:read',
                ].map((slug) => permissionMap.get(slug)).filter((p): p is Permission => p !== undefined),
            },
        ];

        let seededCount = 0;
        for (const roleData of roles) {
            const existing = await this.rolesRepository.findOne({ where: { slug: roleData.slug } });
            if (!existing) {
                await this.rolesRepository.save(roleData);
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
