import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseSeeder } from './database.seeder';
import { PermissionsSeeder } from './permissions.seeder';
import { RolesSeeder } from './roles.seeder';
import { UsersSeeder } from './users.seeder';
import * as configs from '../../config';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: Object.values(configs),
        }),
        PrismaModule,
    ],
    providers: [
        PermissionsSeeder,
        RolesSeeder,
        UsersSeeder,
        DatabaseSeeder,
    ],
})
export class SeederModule { }

