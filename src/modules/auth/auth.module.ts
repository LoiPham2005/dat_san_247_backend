import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { UsersModule } from '../users/users.module';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [
    UsersModule,
    RolesModule,
    PassportModule, // Changed from PassportModule.register({ defaultStrategy: 'jwt' })
    ConfigModule, // Added ConfigModule directly to imports
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({ // Added async
        secret: configService.get<string>('auth.secret'), // Changed key and removed default
        signOptions: {
          expiresIn: (configService.get<string>('auth.expiresIn') as any) || '1d', // Changed key and removed default
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy, FacebookStrategy], // Changed providers: removed GoogleStrategy, FacebookStrategy, added LocalStrategy
  exports: [AuthService, JwtModule], // Removed PassportModule from exports
})
export class AuthModule { }
