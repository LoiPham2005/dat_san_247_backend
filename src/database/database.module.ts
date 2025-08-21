// src/database/database.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../modules/auth/entities/user.entity';
import { DataInitService } from './data-init-service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [DataInitService],
  exports: [DataInitService],
})
export class DatabaseModule {}
