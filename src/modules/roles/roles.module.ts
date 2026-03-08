import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { AdminController } from './controllers/admin.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [PrismaModule, ConfigModule],
    controllers: [AdminController],
    providers: [RolesService],
    exports: [RolesService],
})
export class RolesModule { }
