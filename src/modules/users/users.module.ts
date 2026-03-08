import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersAdminService } from './users-admin.service';
import { MeController } from './controllers/me.controller';
import { AdminController } from './controllers/admin.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [PrismaModule, ConfigModule],
    controllers: [MeController, AdminController],
    providers: [UsersService, UsersAdminService],
    exports: [UsersService, UsersAdminService],
})
export class UsersModule { }
