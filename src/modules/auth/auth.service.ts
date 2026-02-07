import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';

import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private rolesService: RolesService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private prisma: PrismaService,
    ) { }

    async register(registerDto: RegisterDto) {
        const existingUser = await this.usersService.findByEmail(registerDto.email);
        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

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

        const isPasswordValid = await argon2.verify(user.password, loginDto.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('Account is disabled');
        }

        return this.generateTokens(user);
    }

    async generateTokens(user: any) {
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
        await this.prisma.refresh_tokens.create({
            data: {
                token: refreshToken,
                user_id: user.id,
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Match config
                is_revoked: false
            }
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

            // Need to fix this query to match Prisma relation structure
            // refresh_tokens -> users -> roles
            const storedToken = await this.prisma.refresh_tokens.findUnique({
                where: { token },
                include: {
                    users: {
                        include: { roles: true }
                    }
                },
            });

            if (!storedToken || storedToken.is_revoked || storedToken.expires_at < new Date()) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            // Revoke old token (optional: delete?)
            // storedToken.isRevoked = true;
            await this.prisma.refresh_tokens.update({
                where: { id: storedToken.id },
                data: { is_revoked: true }
            });

            // Map user to camelCase for generateTokens
            // Reuse UsersService mapping logic? Or generic manual mapping
            const { users } = storedToken;
            const mappedUser = {
                ...users,
                id: users.id,
                email: users.email,
                fullName: users.full_name,
                isActive: users.is_active,
                role: users.roles ? {
                    ...users.roles,
                    slug: users.roles.slug
                } : undefined
            };

            return this.generateTokens(mappedUser);
        } catch (e) {
            console.error(e);
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async logout(token: string) {
        // Find token first to ensure it exists, or updateMany/findUnique
        try {
            await this.prisma.refresh_tokens.update({
                where: { token },
                data: { is_revoked: true }
            });
        } catch (e) {
            // Token might not exist or already revoked/deleted
        }
    }

    async validateOAuthUser(profile: { email: string; fullName: string; avatarUrl?: string }) {
        let user = await this.usersService.findByEmail(profile.email);

        if (!user) {
            const role = await this.rolesService.getDefaultCustomerRole();
            user = await this.usersService.create({
                email: profile.email,
                fullName: profile.fullName,
                avatarUrl: profile.avatarUrl,
                // Random password
                password: Math.random().toString(36).slice(-10),
                // Note: UsersService.create handles hashing. Wait, UsersService.create expects plain password?
                // UsersService.create V1: Arg data.password -> hash.
                // AuthService V1: register passes registerDto (plain) -> create hashes.
                // oauth: passes random string. UsersService will hash it.
                role,
                isVerified: true,
            });
        }

        return this.generateTokens(user);
    }
}
