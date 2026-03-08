import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TokenService } from './token.service';
import { OtpService } from './otp.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as argon2 from 'argon2';
import { OtpType, UserStatus } from '@prisma/client';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private tokenService: TokenService,
        private otpService: OtpService,
    ) { }

    async register(dto: RegisterDto) {
        const existingUser = await this.prisma.users.findUnique({
            where: { email: dto.email },
        });

        if (existingUser) throw new ConflictException('Email already exists');

        const hashedPassword = await argon2.hash(dto.password);
        const customerRole = await this.prisma.roles.findUnique({ where: { slug: 'customer' } });

        const user = await this.prisma.users.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                full_name: dto.full_name,
                phone: dto.phone,
                role_id: customerRole?.id,
                profile: { create: {} },
            },
        });

        const code = await this.otpService.genCode(user.id, OtpType.EMAIL_VERIFY);
        await this.otpService.sendOTP(user.email, code, OtpType.EMAIL_VERIFY);

        return {
            message: 'Registration successful. Please verify your email.',
            userId: user.id,
        };
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.users.findUnique({
            where: { email: dto.email },
            include: { role: true },
        });

        if (!user || !(await argon2.verify(user.password, dto.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (user.status !== UserStatus.ACTIVE) {
            throw new UnauthorizedException(`Account is ${user.status.toLowerCase()}`);
        }

        await this.prisma.users.update({
            where: { id: user.id },
            data: { last_login_at: new Date() },
        });

        return this.tokenService.issueTokens(user as any);
    }

    async verifyEmail(dto: VerifyOtpDto) {
        const user = await this.prisma.users.findUnique({ where: { email: dto.email } });
        if (!user) throw new BadRequestException('User not found');

        await this.otpService.verifyCode(user.id, dto.code, dto.type);
        await this.prisma.users.update({
            where: { id: user.id },
            data: { is_email_verified: true, email_verified_at: new Date() },
        });

        return { message: 'Email verified successfully' };
    }

    async forgotPassword(email: string) {
        const user = await this.prisma.users.findUnique({ where: { email } });
        if (!user) return { message: 'Success' };

        const code = await this.otpService.genCode(user.id, OtpType.RESET_PASSWORD);
        await this.otpService.sendOTP(user.email, code, OtpType.RESET_PASSWORD);

        return { message: 'Reset code sent' };
    }

    async resetPassword(dto: ResetPasswordDto) {
        const user = await this.prisma.users.findUnique({ where: { email: dto.email } });
        if (!user) throw new BadRequestException('User not found');

        await this.otpService.verifyCode(user.id, dto.code, OtpType.RESET_PASSWORD);
        const hashedPassword = await argon2.hash(dto.new_password);

        await this.prisma.users.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });

        return { message: 'Password reset successfully' };
    }

    async logout(token: string) {
        await this.tokenService.revokeToken(token);
        return { message: 'Logged out' };
    }

    async refresh(token: string) {
        return this.tokenService.rotateRefresh(token);
    }
}
