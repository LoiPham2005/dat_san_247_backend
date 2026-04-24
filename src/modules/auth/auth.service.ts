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
        // 1. Kiểm tra xem email đã tồn tại trong bảng users chính thức chưa
        const existingUser = await this.prisma.users.findUnique({
            where: { email: dto.email },
        });

        if (existingUser) throw new ConflictException('Email already exists');

        // 2. Hash mật khẩu
        const hashedPassword = await argon2.hash(dto.password);
        
        // 3. Tạo mã OTP
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const codeHash = await argon2.hash(code);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

        // 4. Lưu vào bảng hàng chờ (upsert để nếu đăng ký lại thì cập nhật mã mới)
        await this.prisma.pending_registrations.upsert({
            where: { email: dto.email },
            update: {
                full_name: dto.full_name,
                password: hashedPassword,
                phone: dto.phone,
                code_hash: codeHash,
                expires_at: expiresAt,
            },
            create: {
                email: dto.email,
                full_name: dto.full_name,
                password: hashedPassword,
                phone: dto.phone,
                code_hash: codeHash,
                expires_at: expiresAt,
            },
        });

        // 5. Gửi mã OTP về email
        await this.otpService.sendOTP(dto.email, code, OtpType.EMAIL_VERIFY);

        return {
            message: 'OTP sent to email. Please verify to complete registration.',
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
        // 1. Tìm trong bảng hàng chờ
        const pending = await this.prisma.pending_registrations.findUnique({
            where: { email: dto.email },
        });

        if (!pending) {
            throw new BadRequestException('Verification request not found or expired');
        }

        // 2. Kiểm tra hạn dùng
        if (new Date() > pending.expires_at) {
            await this.prisma.pending_registrations.delete({ where: { id: pending.id } });
            throw new BadRequestException('OTP expired');
        }

        // 3. Kiểm tra mã OTP
        const isMatch = await argon2.verify(pending.code_hash, dto.code);
        if (!isMatch) {
            throw new BadRequestException('Invalid OTP code');
        }

        // 4. Nếu khớp -> Chính thức tạo User trong bảng users
        const customerRole = await this.prisma.roles.findUnique({ where: { slug: 'customer' } });

        const user = await this.prisma.users.create({
            data: {
                email: pending.email,
                password: pending.password,
                full_name: pending.full_name,
                phone: pending.phone,
                role_id: customerRole?.id,
                is_email_verified: true,
                email_verified_at: new Date(),
                profile: { create: {} },
            },
        });

        // 5. Xóa khỏi hàng chờ
        await this.prisma.pending_registrations.delete({ where: { id: pending.id } });

        return { message: 'Email verified and account created successfully' };
    }

    async verifyOtp(dto: VerifyOtpDto) {
        const user = await this.prisma.users.findUnique({ where: { email: dto.email } });
        if (!user) throw new BadRequestException('User not found');

        // Chỉ kiểm tra (peek) xem đúng hay sai chứ KHÔNG "tiêu thụ" mã
        await this.otpService.verifyCode(user.id, dto.code, dto.type as OtpType, false);

        return { message: 'OTP is valid' };
    }

    async forgotPassword(email: string) {
        const user = await this.prisma.users.findUnique({ where: { email } });
        if (!user) return { message: 'Success' };

        const code = await this.otpService.genCode(user.id, OtpType.RESET_PASSWORD);
        await this.otpService.sendOTP(user.email, code, OtpType.RESET_PASSWORD);

        return { message: 'Reset code sent' };
    }

    async resendOtp(email: string, type: OtpType) {
        if (type === OtpType.EMAIL_VERIFY) {
            // Kiểm tra trong hàng chờ đăng ký
            const pending = await this.prisma.pending_registrations.findUnique({ where: { email } });
            if (!pending) throw new BadRequestException('Registration not found');

            const code = Math.floor(100000 + Math.random() * 900000).toString();
            const codeHash = await argon2.hash(code);

            await this.prisma.pending_registrations.update({
                where: { email },
                data: { code_hash: codeHash, expires_at: new Date(Date.now() + 10 * 60 * 1000) },
            });

            await this.otpService.sendOTP(email, code, OtpType.EMAIL_VERIFY);
        } else {
            // Các loại khác (quên mật khẩu...) thì dùng user_id
            const user = await this.prisma.users.findUnique({ where: { email } });
            if (!user) throw new BadRequestException('User not found');

            const code = await this.otpService.genCode(user.id, type);
            await this.otpService.sendOTP(user.email, code, type);
        }

        return { message: 'OTP resent successfully' };
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

    async getMe(userId: string) {
        const user = await this.prisma.users.findUnique({
            where: { id: userId },
            include: {
                role: true,
                profile: true,
            },
        });
        if (!user) throw new BadRequestException('User not found');

        const venueStaffRecord = await this.prisma.venue_staff.findFirst({
            where: { user_id: userId, is_active: true },
            select: { id: true },
        });

        return {
            ...user,
            is_venue_staff: !!venueStaffRecord,
        };
    }
}
