import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../../modules/permissions/entities/permission.entity';
import { Role } from '../../modules/roles/entities/role.entity';
import { User } from '../../modules/users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DatabaseSeeder implements OnModuleInit {
    constructor(
        @InjectRepository(Permission)
        private permissionsRepository: Repository<Permission>,
        @InjectRepository(Role)
        private rolesRepository: Repository<Role>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async onModuleInit() {
        await this.seedPermissions();
        await this.seedRoles();
        await this.seedUsers();
    }

    private async seedPermissions() {
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
            const existing = await this.permissionsRepository.findOne({ where: { slug: p.slug } });
            if (!existing) {
                await this.permissionsRepository.save(p);
                seededCount++;
            }
        }

        if (seededCount > 0) {
            console.log(`✅ Seeded ${seededCount} new permissions`);
        } else {
            console.log('✅ Permissions already up to date');
        }
    }

    private async seedRoles() {
        // Get permissions
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
            console.log(`✅ Seeded ${seededCount} new roles`);
        } else {
            console.log('✅ Roles already up to date');
        }
    }

    private async seedUsers() {
        const hashedPassword = await bcrypt.hash('Password123@', 10);
        const roles = await this.rolesRepository.find();
        const roleMap = new Map(roles.map((r) => [r.slug, r]));

        const userConfigs = [
            {
                email: 'superadmin@datsan247.com',
                password: hashedPassword,
                fullName: 'Super Admin',
                phone: '0900000000',
                role: roleMap.get('super-admin'),
                isActive: true,
                isVerified: true,
            },
            {
                email: 'admin@test.com',
                password: hashedPassword,
                fullName: 'Test Admin',
                phone: '0910000000',
                role: roleMap.get('admin'),
                isActive: true,
                isVerified: true,
            },
            {
                email: 'owner@test.com',
                password: hashedPassword,
                fullName: 'Test Owner',
                phone: '0911111111',
                role: roleMap.get('owner'),
                isActive: true,
                isVerified: true,
            },
            {
                email: 'staff@test.com',
                password: hashedPassword,
                fullName: 'System Staff',
                phone: '0920000000',
                role: roleMap.get('staff'),
                isActive: true,
                isVerified: true,
            },
            {
                email: 'venuestaff@test.com',
                password: hashedPassword,
                fullName: 'Venue Staff',
                phone: '0922222222',
                role: roleMap.get('venue-staff'),
                isActive: true,
                isVerified: true,
            },
            {
                email: 'customer@test.com',
                password: hashedPassword,
                fullName: 'Test Customer',
                phone: '0933333333',
                role: roleMap.get('customer'),
                isActive: true,
                isVerified: true,
            },
        ];

        let seededCount = 0;
        for (const config of userConfigs) {
            const existing = await this.usersRepository.findOne({ where: { email: config.email } });
            if (!existing) {
                const user = this.usersRepository.create(config);
                await this.usersRepository.save(user);
                seededCount++;
            }
        }

        if (seededCount > 0) {
            console.log(`✅ Seeded ${seededCount} new users (Password: Password123@)`);
        } else {
            console.log('✅ Users already seeded');
        }
    }
}
