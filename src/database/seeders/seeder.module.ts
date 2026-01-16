import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseSeeder } from './database.seeder';
import { User } from '../../modules/users/entities/user.entity';
import { Role } from '../../modules/roles/entities/role.entity';
import { Permission } from '../../modules/permissions/entities/permission.entity';
import * as configs from '../../config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: Object.values(configs),
        }),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                type: 'postgres',
                host: config.get('database.host'),
                port: config.get('database.port'),
                username: config.get('database.username'),
                password: config.get('database.password'),
                database: config.get('database.database'),
                entities: [__dirname + '/../../modules/**/*.entity.{ts,js}'],
                autoLoadEntities: true,
                synchronize: false,
            }),
        }),
        TypeOrmModule.forFeature([User, Role, Permission]),
    ],
    providers: [DatabaseSeeder],
})
export class SeederModule { }
