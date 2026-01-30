import { Injectable, OnModuleInit } from '@nestjs/common';
import { PermissionsSeeder } from './permissions.seeder';
import { RolesSeeder } from './roles.seeder';
import { UsersSeeder } from './users.seeder';
import { logger } from '@sentry/nestjs';

@Injectable()
export class DatabaseSeeder implements OnModuleInit {
    constructor(
        private readonly permissionsSeeder: PermissionsSeeder,
        private readonly rolesSeeder: RolesSeeder,
        private readonly usersSeeder: UsersSeeder,
    ) { }

    async onModuleInit() {
        logger.info('🌱 Starting database seeding...');

        try {
            // Seed permissions first
            await this.permissionsSeeder.seed();

            // Seed roles (depends on permissions)
            await this.rolesSeeder.seed();

            // Seed users (depends on roles)
            await this.usersSeeder.seed();

            logger.info('✅ Database seeding completed successfully');
        } catch (error) {
            logger.error('❌ Database seeding failed:', error);
            throw error;
        }
    }
}
