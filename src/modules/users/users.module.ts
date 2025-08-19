import { Module } from "@nestjs/common";
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { User } from "./entities/user.entity"; 
import { CaslModule } from "src/casl/casl.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        CaslModule, 
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService]
})
export class UsersModule { }

