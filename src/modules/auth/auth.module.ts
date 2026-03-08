import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { OtpService } from './otp.service';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';

@Module({
    imports: [
        PassportModule,
        JwtModule.register({}),
        ConfigModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, OtpService, TokenService, JwtStrategy],
    exports: [AuthService],
})
export class AuthModule { }
