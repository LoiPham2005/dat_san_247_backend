// src/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Req, UseInterceptors, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from '../refresh-tokens/dto/refresh-token.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';
import { ForgotPasswordDto, ResetPasswordDto, VerifyOTPDto } from './dto/forgot-password.dto';
import { AuthGuard } from '@nestjs/passport';
import { fail, success } from 'src/common/helper/response.helper';
import { LoggingInterceptor } from 'src/common/interceptors/logging.interceptor';
import { LoginDto } from './dto/login.dto';

// Add interface to extend Express Request
interface AuthRequest extends Request {
    user: any; // Or define a proper User type
}

@Controller('auth')
@UseInterceptors(LoggingInterceptor)
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        try {
            const result = await this.authService.register(registerDto);
            return success(result.data, result.message);
        } catch (error) {
            return fail(error.message);
        }
    }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Req() req: Request, @Body() loginDto: LoginDto) {
        return this.authService.login(loginDto, req);
    }

    @Post('refresh')
    async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
        return this.authService.refreshToken(refreshTokenDto);
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    async logout(@Body() body: RefreshTokenDto) {
        return this.authService.logout(body.refreshToken);
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout-all')
    async logoutAll(@Req() req: AuthRequest) {
        return this.authService.logoutAll(req.user.id);
    }

    @Post('forgot-password')
    async forgotPassword(@Body() dto: ForgotPasswordDto) {
        try {
            const result = await this.authService.forgotPassword(dto.email);
            return success(null, result.message);
        } catch (error) {
            return fail(error.message);
        }
    }

    @Post('verify-otp')
    async verifyOTP(@Body() dto: VerifyOTPDto) {
        return this.authService.verifyOTP(dto.email, dto.otp);
    }

    @Post('reset-password')
    async resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto);
    }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth() {
        // Guard redirects to Google
    }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req: AuthRequest) {
        return this.authService.login(req.user, req);
    }

    @Get('facebook')
    @UseGuards(AuthGuard('facebook'))
    async facebookAuth() {
        // Guard redirects to Facebook
    }

    @Get('facebook/callback')
    @UseGuards(AuthGuard('facebook'))
    async facebookAuthRedirect(@Req() req: AuthRequest) {
        return this.authService.login(req.user, req);
    }

}