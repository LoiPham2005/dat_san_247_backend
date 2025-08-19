import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import * as argon2 from 'argon2';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResetPasswordDto } from './dto/forgot-password.dto';
import { success } from 'src/common/helper/response.helper';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
    private otpStore: Map<string, { otp: string; timestamp: number }> = new Map();

    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(RefreshToken)
        private refreshTokenRepository: Repository<RefreshToken>,
        private mailerService: MailerService,
    ) { }

    private generateOTP(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // ================= REGISTER =================
    async register(dto: RegisterDto) {
        const existing = await this.userRepository.findOne({ where: [{ email: dto.email }, { username: dto.username }] });
        if (existing) throw new BadRequestException('Email hoặc username đã tồn tại');

        const hashedPassword = await argon2.hash(dto.password);

        const newUser = this.userRepository.create({
            ...dto,
            password: hashedPassword
        });
        await this.userRepository.save(newUser);

        const payload = { id: newUser.id };

        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_SECRET'),
            expiresIn: '15m'
        });
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
            expiresIn: '7d'
        });

        // Lưu refresh token
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        const refreshTokenEntity = this.refreshTokenRepository.create({
            token: refreshToken,
            userId: newUser.id,
            deviceInfo: 'Registration',
            ipAddress: '0.0.0.0',
            expiresAt
        });
        await this.refreshTokenRepository.save(refreshTokenEntity);

        const { password, ...userResult } = newUser;

        return success({ user: userResult, accessToken, refreshToken }, 'Đăng ký thành công');
    }

    // ================= LOGIN =================
    async login(dto: LoginDto, req: Request) {
        const user = await this.userRepository.findOne({ where: { email: dto.email } });
        if (!user) throw new UnauthorizedException('Email hoặc mật khẩu không đúng');

        const isPasswordValid = await argon2.verify(user.password, dto.password);
        if (!isPasswordValid) throw new UnauthorizedException('Email hoặc mật khẩu không đúng');

        const payload = { id: user.id };

        await this.refreshTokenRepository.update({ userId: user.id, isRevoked: false }, { isRevoked: true });

        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_SECRET'),
            expiresIn: '15m'
        });
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
            expiresIn: '7d'
        });

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const refreshTokenEntity = this.refreshTokenRepository.create({
            token: refreshToken,
            userId: user.id,
            deviceInfo: req.headers['user-agent'] || 'Unknown',
            ipAddress: req.ip,
            expiresAt
        });
        await this.refreshTokenRepository.save(refreshTokenEntity);

        const { password, ...userResult } = user;

        return success({ user: userResult, accessToken, refreshToken }, 'Đăng nhập thành công');
    }

    // ================= REFRESH TOKEN =================
    async refreshToken(dto: RefreshTokenDto) {
        const tokenEntity = await this.refreshTokenRepository.findOne({
            where: { token: dto.refreshToken, isRevoked: false },
            relations: ['user']
        });
        if (!tokenEntity) throw new UnauthorizedException('Refresh token không hợp lệ');

        if (new Date() > tokenEntity.expiresAt) {
            await this.refreshTokenRepository.update({ id: tokenEntity.id }, { isRevoked: true });
            throw new UnauthorizedException('Refresh token đã hết hạn');
        }

        const payload = { id: tokenEntity.user.id };
        const newAccessToken = this.jwtService.sign(payload, { secret: this.configService.get('JWT_SECRET'), expiresIn: '15m' });
        const newRefreshToken = this.jwtService.sign(payload, { secret: this.configService.get('JWT_REFRESH_SECRET'), expiresIn: '7d' });

        // Vô hiệu hóa token cũ
        tokenEntity.isRevoked = true;
        await this.refreshTokenRepository.save(tokenEntity);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const newRefreshTokenEntity = this.refreshTokenRepository.create({
            token: newRefreshToken,
            userId: tokenEntity.user.id,
            deviceInfo: tokenEntity.deviceInfo,
            ipAddress: tokenEntity.ipAddress,
            expiresAt
        });
        await this.refreshTokenRepository.save(newRefreshTokenEntity);

        return success({
            message: 'Refresh token thành công',
            data: { accessToken: newAccessToken, refreshToken: newRefreshToken }
        });
    }

    // ================= LOGOUT =================
    async logout(refreshToken: string) {
        const tokenEntity = await this.refreshTokenRepository.findOne({ where: { token: refreshToken } });
        if (tokenEntity) {
            tokenEntity.isRevoked = true;
            await this.refreshTokenRepository.save(tokenEntity);
        }
        return success({ success: true, message: 'Đăng xuất thành công' });
    }

    async logoutAll(userId: number) {
        await this.refreshTokenRepository.update({ userId, isRevoked: false }, { isRevoked: true });
        return { status: true, message: 'Đăng xuất khỏi tất cả thiết bị thành công' };
    }

    // ================= FORGOT PASSWORD =================
    async forgotPassword(email: string) {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) throw new NotFoundException('Email không tồn tại');

        const otp = this.generateOTP();
        this.otpStore.set(email, { otp, timestamp: Date.now() + 5 * 60 * 1000 });

        await this.mailerService.sendMail({
            to: email,
            subject: 'Mã OTP đặt lại mật khẩu',
            text: `Mã OTP của bạn là: ${otp}. Hết hạn sau 5 phút.`
        });

        return { status: true, message: 'OTP đã được gửi' };
    }

    async verifyOTP(email: string, otp: string) {
        const data = this.otpStore.get(email);
        if (!data) throw new BadRequestException('OTP không tồn tại');
        if (Date.now() > data.timestamp) { this.otpStore.delete(email); throw new BadRequestException('OTP đã hết hạn'); }
        if (data.otp !== otp) throw new BadRequestException('OTP không đúng');
        return { status: true, message: 'Xác thực OTP thành công' };
    }

    async resetPassword(dto: ResetPasswordDto) {
        const { email, newPassword } = dto;
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) throw new NotFoundException('Người dùng không tồn tại');

        const storedData = this.otpStore.get(email);
        if (!storedData) throw new BadRequestException('Vui lòng yêu cầu OTP trước');

        const hashedPassword = await argon2.hash(newPassword);
        await this.userRepository.update(user.id, { password: hashedPassword });
        this.otpStore.delete(email);

        return { status: true, message: 'Đặt lại mật khẩu thành công' };
    }


    async validateOAuthLogin(profile: {
        email: string,
        username?: string,
        avatar?: string,
        provider: string,
        providerId: string
    }, provider: string) {

        let user = await this.userRepository.findOne({ where: { email: profile.email } });

        if (!user) {
            // Nếu chưa có user, tạo mới
            user = this.userRepository.create({
                email: profile.email,
                username: profile.username || profile.email.split('@')[0],
                avatar: profile.avatar,
                provider,
                providerId: profile.providerId,
                password: Math.random().toString(36).slice(-8) // password random
            });
            await this.userRepository.save(user);
        }

        const payload = { id: user.id };
        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_SECRET'),
            expiresIn: '15m'
        });
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
            expiresIn: '7d'
        });

        // Lưu refresh token
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        const refreshTokenEntity = this.refreshTokenRepository.create({
            token: refreshToken,
            userId: user.id,
            deviceInfo: `${provider} OAuth`,
            ipAddress: '0.0.0.0',
            expiresAt
        });
        await this.refreshTokenRepository.save(refreshTokenEntity);

        const { password, ...userResult } = user;
        return { user: userResult, accessToken, refreshToken };
    }


    async validateUserCredentials(usernameOrEmail: string, password: string) {
        const user = await this.userRepository.findOne({
            where: [
                { username: usernameOrEmail },
                { email: usernameOrEmail }
            ]
        });

        if (!user) throw new UnauthorizedException('Thông tin đăng nhập không chính xác');

        const isValid = await argon2.verify(user.password, password);
        if (!isValid) throw new UnauthorizedException('Thông tin đăng nhập không chính xác');

        const { password: _, ...result } = user;
        return result;
    }

}
