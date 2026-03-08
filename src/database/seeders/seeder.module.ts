import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { DatabaseSeeder } from './database.seeder';
import { RolesSeeder } from './roles.seeder';
import { PermissionsSeeder } from './permissions.seeder';
import { SportTypesSeeder } from './sport-types.seeder';
import { SettingsSeeder } from './settings.seeder';
import { UsersSeeder } from './users.seeder';

@Module({
    imports: [PrismaModule],
    providers: [
        DatabaseSeeder,
        RolesSeeder,
        PermissionsSeeder,
        SportTypesSeeder,
        SettingsSeeder,
        UsersSeeder,
    ],
})
export class SeederModule { }
