import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';

import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../../shared/mail/mail.service';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password-reset.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private rolesService: RolesService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private prisma: PrismaService,
        private mailService: MailService,
    ) { }

    async forgotPassword(dto: ForgotPasswordDto) {
        const user = await this.usersService.findByEmail(dto.email);
        if (!user) {
            // Don't reveal if user exists for security, but we can return success
            return { message: 'Nếu email tồn tại, mã OTP đã được gửi' };
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        await this.prisma.users.update({
            where: { id: user.id },
            data: {
                reset_password_otp: otp,
                reset_password_expires: expires,
            },
        });

        // Send Email
        try {
            const template = await this.prisma.email_templates.findFirst({
                where: { template_name: 'PASSWORD_RESET' }
            });

            if (template) {
                await this.mailService.sendWithTemplate(user.email, template, {
                    name: user.fullName,
                    otp: otp,
                });
            } else {
                // Fallback if template not seeded
                await this.mailService.sendMail(
                    user.email,
                    'Mã khôi phục mật khẩu',
                    `<p>Chào ${user.fullName}, mã OTP khôi phục mật khẩu của bạn là: <b>${otp}</b>. Mã này có hiệu lực trong 15 phút.</p>`
                );
            }
        } catch (error) {
            console.error('Failed to send reset email:', error);
        }

        return { message: 'Mã OTP đã được gửi tới email của bạn' };
    }

    async resetPassword(dto: ResetPasswordDto) {
        const user = await this.prisma.users.findFirst({
            where: {
                reset_password_otp: dto.otp,
                reset_password_expires: { gt: new Date() },
            },
        });

        if (!user) {
            throw new BadRequestException('Mã OTP không chính xác hoặc đã hết hạn');
        }

        const hashedPassword = await argon2.hash(dto.newPassword, { type: argon2.argon2id });

        await this.prisma.users.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                reset_password_otp: null,
                reset_password_expires: null,
            },
        });

        return { message: 'Đặt lại mật khẩu thành công' };
    }

    async register(registerDto: RegisterDto) {
        if (registerDto.password !== registerDto.confirmPassword) {
            throw new BadRequestException('Mật khẩu xác nhận không khớp');
        }

        const existingUser = await this.usersService.findByEmail(registerDto.email);
        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        if (registerDto.phone) {
            const existingPhone = await this.usersService.findByPhone(registerDto.phone);
            if (existingPhone) {
                throw new ConflictException('Số điện thoại này đã được sử dụng');
            }
        }

        // Find default role if not provided
        let role;
        if (registerDto.role) {
            role = await this.rolesService.findBySlug(registerDto.role.toLowerCase());
        } else {
            role = await this.rolesService.getDefaultCustomerRole();
        }

        const user = await this.usersService.create({
            ...registerDto,
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
