import { Injectable, Logger } from '@nestjs/common';
import { RolesSeeder } from './roles.seeder';
import { PermissionsSeeder } from './permissions.seeder';
import { SportTypesSeeder } from './sport-types.seeder';
import { SettingsSeeder } from './settings.seeder';
import { UsersSeeder } from './users.seeder';

@Injectable()
export class DatabaseSeeder {
    private readonly logger = new Logger(DatabaseSeeder.name);

    constructor(
        private readonly rolesSeeder: RolesSeeder,
        private readonly permissionsSeeder: PermissionsSeeder,
        private readonly sportTypesSeeder: SportTypesSeeder,
        private readonly settingsSeeder: SettingsSeeder,
        private readonly usersSeeder: UsersSeeder,
    ) { }

    async seed() {
        this.logger.log('Starting seed process...');

        await this.rolesSeeder.seed();
        await this.permissionsSeeder.seed();
        await this.sportTypesSeeder.seed();
        await this.settingsSeeder.seed();
        await this.usersSeeder.seed();

        this.logger.log('Seed process completed!');
    }
}
