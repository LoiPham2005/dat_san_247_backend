import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SuperAdminUsersController } from './super-admin-users.controller';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController, SuperAdminUsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule { }
