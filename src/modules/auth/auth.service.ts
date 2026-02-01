import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';

import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshToken } from './entities/refresh-token.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private rolesService: RolesService,
        private jwtService: JwtService,
        private configService: ConfigService,
        @InjectRepository(RefreshToken)
        private refreshTokenRepository: Repository<RefreshToken>,
    ) { }

    async register(registerDto: RegisterDto) {
        const existingUser = await this.usersService.findByEmail(registerDto.email);
        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        // const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const hashedPassword = await argon2.hash(registerDto.password, { type: argon2.argon2id });

        // Find default role if not provided
        let role;
        if (registerDto.role) {
            role = await this.rolesService.findBySlug(registerDto.role.toLowerCase());
        } else {
            role = await this.rolesService.getDefaultCustomerRole();
        }

        const user = await this.usersService.create({
            ...registerDto,
            password: hashedPassword,
            role,
        });

        return this.generateTokens(user);
    }

    async login(loginDto: LoginDto) {
        const user = await this.usersService.findByEmail(loginDto.email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        const isPasswordValid = await argon2.verify(user.password, loginDto.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('Account is disabled');
        }

        return this.generateTokens(user);
    }

    async generateTokens(user: User) {
        const payload = {
            email: user.email,
            sub: user.id,
            role: user.role?.slug
        };

        const accessToken = this.jwtService.sign(payload);

        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('auth.refreshSecret'),
            expiresIn: (this.configService.get<string>('auth.refreshExpiresIn') as any) || '7d',
        });

        // Store refresh token
        await this.refreshTokenRepository.save({
            token: refreshToken,
            user: user,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Match config
        });

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role?.slug,
            }
        };
    }

    async refreshTokens(token: string) {
        try {
            const payload = this.jwtService.verify(token, {
                secret: this.configService.get<string>('auth.refreshSecret'),
            });

            const storedToken = await this.refreshTokenRepository.findOne({
                where: { token, isRevoked: false },
                relations: ['user', 'user.role'],
            });

            if (!storedToken || storedToken.expiresAt < new Date()) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            // Revoke old token
            storedToken.isRevoked = true;
            await this.refreshTokenRepository.save(storedToken);

            return this.generateTokens(storedToken.user);
        } catch (e) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async logout(token: string) {
        await this.refreshTokenRepository.update({ token }, { isRevoked: true });
    }

    async validateOAuthUser(profile: { email: string; fullName: string; avatarUrl?: string }) {
        let user = await this.usersService.findByEmail(profile.email);

        if (!user) {
            const role = await this.rolesService.getDefaultCustomerRole();
            user = await this.usersService.create({
                email: profile.email,
                fullName: profile.fullName,
                avatarUrl: profile.avatarUrl,
                // password: await bcrypt.hash(Math.random().toString(36).slice(-10), 10), // Random password
                password: await argon2.hash(Math.random().toString(36).slice(-10), { type: argon2.argon2id }), 
                role,
                isVerified: true, // OAuth emails are usually verified
            });
        }

        return this.generateTokens(user);
    }
}
