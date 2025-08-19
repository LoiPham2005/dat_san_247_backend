// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RefreshToken } from './entities/refresh-token.entity';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { ResetPasswordDto } from './dto/forgot-password.dto';
import { InvalidCredentialsException, TokenExpiredException } from 'src/common/exceptions/custom-exceptions';
import { success } from 'src/common/helper/response.helper';
import * as argon2 from 'argon2'; 

@Injectable()
export class AuthService {
    private otpStore: Map<string, { otp: string; timestamp: number }> = new Map();

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
        @InjectRepository(RefreshToken)
        private refreshTokenRepository: Repository<RefreshToken>,
        private mailerService: MailerService,
    ) { }

    // Generate 6 digit OTP
    private generateOTP(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async register(registerDto: RegisterDto) {
        const { username, email, password } = registerDto;

        // Check existing user
        const existingUser = await this.usersService.findByUsernameOrEmail(username, email);
        if (existingUser) {
            throw new BadRequestException('Username hoặc email đã tồn tại');
        }

        // Hash password
        const hashedPassword = await argon2.hash(password);

        // Create new user
        const newUser = await this.usersService.create({
            ...registerDto,
            password: hashedPassword,
        });

        // Generate tokens
        const payload = { id: newUser.id };

        // Create access token
        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_SECRET'),
            expiresIn: '2h',
        });

        // Create refresh token
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            expiresIn: '7d',
        });

        // Save refresh token to database
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const refreshTokenEntity = new RefreshToken();
        refreshTokenEntity.token = refreshToken;
        refreshTokenEntity.userId = newUser.id;
        refreshTokenEntity.deviceInfo = 'Registration';
        refreshTokenEntity.ipAddress = '0.0.0.0';
        refreshTokenEntity.expiresAt = expiresAt;

        await this.refreshTokenRepository.save(refreshTokenEntity);

        // Remove password from response
        const { password: _, ...result } = newUser;

        // return {
        //     success: true,
        //     message: 'Đăng ký thành công',
        //     data: {
        //         user: result,
        //         accessToken,
        //         refreshToken,
        //     }
        // };

        return success({
            status: true,
            message: 'Đăng ký thành công',
            data: {
                user: result,
                accessToken,
                refreshToken,
            }
        });
    }

    async validateUserCredentials(usernameOrEmail: string, password: string) {
        // Tìm user bằng username hoặc email
        const user = await this.usersService.findByUsernameOrEmail(
            usernameOrEmail, 
            usernameOrEmail
        );

        if (!user) {
            throw new InvalidCredentialsException();
        }

 // ✅ Verify password với argon2
        const passwordValid = await argon2.verify(user.password, password);
        if (!passwordValid) {
            throw new InvalidCredentialsException();
        }

        // Loại bỏ password trước khi trả về
        const { password: _, ...result } = user;
        return result;
    }

    async login(user: any, req: Request) {
        const payload = { id: user.id };

        // Trước khi tạo token mới, nên vô hiệu hóa các token cũ
        await this.refreshTokenRepository.update(
            { userId: user.id, isRevoked: false },
            { isRevoked: true }
        );

        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_SECRET'),
            expiresIn: '15m',
        });

        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            expiresIn: '7d',
        });

        // Lưu refresh token vào database
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        // Fix: Sử dụng Partial<RefreshToken>
        const refreshTokenData: Partial<RefreshToken> = {
            token: refreshToken,
            userId: user.id,
            deviceInfo: req.headers['user-agent'],
            ipAddress: req.ip,
            expiresAt: expiresAt,
        };

        const refreshTokenEntity = this.refreshTokenRepository.create(refreshTokenData);
        await this.refreshTokenRepository.save(refreshTokenEntity);

        return {
            status: true,
            message: 'Đăng nhập thành công',
            data: {
                user,
                accessToken,
                refreshToken,
                message: 'Đăng nhập thành công',
            }
        };
    }

    async refreshToken(refreshTokenDto: RefreshTokenDto) {
        const { refreshToken } = refreshTokenDto;

        try {
            // Verify token và kiểm tra trong DB
            const tokenEntity = await this.refreshTokenRepository.findOne({
                where: {
                    token: refreshToken,
                    isRevoked: false
                },
                relations: ['user']
            });

            if (!tokenEntity) {
                throw new UnauthorizedException('Refresh token không hợp lệ');
            }

            // Kiểm tra hết hạn
            if (new Date() > tokenEntity.expiresAt) {
                // Vô hiệu hóa token cũ ngay lập tức
                await this.refreshTokenRepository.update(
                    { id: tokenEntity.id },
                    { isRevoked: true }
                );
                throw new TokenExpiredException();
            }

            // Tạo token mới
            const payload = { id: tokenEntity.user.id };
            const newAccessToken = this.jwtService.sign(payload, {
                secret: this.configService.get('JWT_SECRET'),
                expiresIn: '15m'
            });

            // Tạo refresh token mới và vô hiệu hóa token cũ
            const newRefreshToken = this.jwtService.sign(payload, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
                expiresIn: '7d'
            });

            // Vô hiệu hóa token cũ
            tokenEntity.isRevoked = true;
            await this.refreshTokenRepository.save(tokenEntity);

            // Lưu refresh token mới
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

            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            };
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async logout(refreshToken: string) {
        try {
            // Tìm và đánh dấu token đã bị vô hiệu hóa
            const tokenEntity = await this.refreshTokenRepository.findOne({
                where: { token: refreshToken },
            });

            if (tokenEntity) {
                tokenEntity.isRevoked = true;
                await this.refreshTokenRepository.save(tokenEntity);
            }

            return {
                status: true,
                message: 'Đăng xuất thành công',
            };
        } catch (error) {
            throw new BadRequestException('Đăng xuất thất bại');
        }
    }

    async logoutAll(userId: number) {
        try {
            // Vô hiệu hóa tất cả refresh token của user
            await this.refreshTokenRepository.update(
                { userId, isRevoked: false },
                { isRevoked: true }
            );

            return {
                status: true,
                message: 'Đăng xuất khỏi tất cả thiết bị thành công',
            };
        } catch (error) {
            throw new BadRequestException('Đăng xuất thất bại');
        }
    }

    async forgotPassword(email: string) {
        // Check if user exists
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new NotFoundException('Email không tồn tại trong hệ thống');
        }

        // Generate OTP
        const otp = this.generateOTP();

        // Store OTP with 5 minutes expiration
        this.otpStore.set(email, {
            otp,
            timestamp: Date.now() + 5 * 60 * 1000 // 5 minutes
        });

        // Send email with OTP using simple text
        await this.mailerService.sendMail({
            to: email,
            subject: 'Mã OTP đặt lại mật khẩu',
            text: `Xin chào ${user.username},\n\nMã OTP của bạn là: ${otp}\n\nMã này sẽ hết hạn sau 5 phút.\n\nNếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.\n\nTrân trọng,\nShop ABC`,
        });

        return {
            status: true,
            message: 'Mã OTP đã được gửi đến email của bạn',
        };
    }

    async verifyOTP(email: string, otp: string) {
        const storedData = this.otpStore.get(email);

        if (!storedData) {
            throw new BadRequestException('OTP không tồn tại hoặc đã hết hạn');
        }

        if (Date.now() > storedData.timestamp) {
            this.otpStore.delete(email);
            throw new BadRequestException('OTP đã hết hạn');
        }

        if (storedData.otp !== otp) {
            throw new BadRequestException('Mã OTP không chính xác');
        }

        return {
            status: true,
            message: 'Xác thực OTP thành công',
        };
    }

    async resetPassword(dto: ResetPasswordDto) {
        const { email, newPassword } = dto;

        // Find user
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new NotFoundException('Người dùng không tồn tại');
        }

        // Check if OTP exists and is verified
        const storedData = this.otpStore.get(email);
        if (!storedData) {
            throw new BadRequestException('Vui lòng yêu cầu mã OTP trước khi đặt lại mật khẩu');
        }

        // Hash new password
        const hashedPassword = await argon2.hash(newPassword);

        // Update password in database
        await this.usersService.updatePassword(user.id, hashedPassword);

        // Clear OTP
        this.otpStore.delete(email);

        return {
            status: true,
            message: 'Đặt lại mật khẩu thành công',
        };
    }

    async validateOAuthLogin(profile: any, provider: string) {
        try {
            // Check if user exists
            let user = await this.usersService.findByEmail(profile.email);

            if (!user) {
                // Create new user if doesn't exist
                user = await this.usersService.create({
                    username: profile.username,
                    email: profile.email,
                    password: Math.random().toString(36).slice(-8), // Generate random password
                    avatar: profile.avatar,
                    provider: provider,
                    providerId: profile.id
                });
            }

            // Generate tokens
            const payload = { id: user.id };
            const accessToken = this.jwtService.sign(payload, {
                secret: this.configService.get<string>('JWT_SECRET'),
                expiresIn: '15m',
            });

            const refreshToken = this.jwtService.sign(payload, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                expiresIn: '7d',
            });

            // Save refresh token
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);

            const refreshTokenEntity = new RefreshToken();
            refreshTokenEntity.token = refreshToken;
            refreshTokenEntity.userId = user.id;
            refreshTokenEntity.deviceInfo = `${provider} OAuth`;
            refreshTokenEntity.ipAddress = '0.0.0.0';
            refreshTokenEntity.expiresAt = expiresAt;

            await this.refreshTokenRepository.save(refreshTokenEntity);

            return {
                user,
                accessToken,
                refreshToken
            };
        } catch (error) {
            throw new UnauthorizedException('Invalid credentials');
        }
    }
}