// src/database/database.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../modules/auth/entities/user.entity';
import { Role } from '../modules/roles/entities/role.entity';
import { DataInitService } from './data-init-service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role])],
  providers: [DataInitService],
  exports: [DataInitService],
})
export class DatabaseModule { }
