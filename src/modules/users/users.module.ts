import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersAdminService } from './users-admin.service';
import { MeController } from './controllers/me.controller';
import { AdminController } from './controllers/admin.controller';

@Module({
    controllers: [MeController, AdminController],
    providers: [UsersService, UsersAdminService],
    exports: [UsersService],
})
export class UsersModule { }
