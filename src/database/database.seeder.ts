import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../modules/permissions/entities/permission.entity';
import { Role } from '../modules/roles/entities/role.entity';

@Injectable()
export class DatabaseSeeder implements OnModuleInit {
    constructor(
        @InjectRepository(Permission)
        private permissionsRepository: Repository<Permission>,
        @InjectRepository(Role)
        private rolesRepository: Repository<Role>,
    ) { }

    async onModuleInit() {
        await this.seedPermissions();
        await this.seedRoles();
    }

    private async seedPermissions() {
        const count = await this.permissionsRepository.count();
        if (count > 0) {
            console.log('✅ Permissions already seeded');
            return;
        }

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

            // Analytics
            { resource: 'analytics', action: 'view', slug: 'analytics:view', description: 'View analytics' },

            // Roles & Permissions
            { resource: 'roles', action: 'create', slug: 'roles:create', description: 'Create roles' },
            { resource: 'roles', action: 'read', slug: 'roles:read', description: 'View roles' },
            { resource: 'roles', action: 'update', slug: 'roles:update', description: 'Update roles' },
            { resource: 'roles', action: 'delete', slug: 'roles:delete', description: 'Delete roles' },

            // Wildcard (Super Admin)
            { resource: '*', action: '*', slug: '*', description: 'All permissions (Super Admin)' },
        ];

        await this.permissionsRepository.save(permissions);
        console.log(`✅ Seeded ${permissions.length} permissions`);
    }

    private async seedRoles() {
        const count = await this.rolesRepository.count();
        if (count > 0) {
            console.log('✅ Roles already seeded');
            return;
        }

        // Get permissions
        const allPermissions = await this.permissionsRepository.find();
        const permissionMap = new Map(allPermissions.map((p) => [p.slug, p]));

        const roles = [
            {
                name: 'Super Admin',
                slug: 'admin',
                description: 'Full system access',
                isSystem: true,
                permissions: [permissionMap.get('*')].filter((p): p is Permission => p !== undefined),
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
                slug: 'venue_staff',
                description: 'Check-in customers and view bookings',
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

        await this.rolesRepository.save(roles);
        console.log(`✅ Seeded ${roles.length} roles`);
    }
}
