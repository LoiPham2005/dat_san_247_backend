// src/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Req, UseInterceptors, Get, Delete, Param } from '@nestjs/common';
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
import { RolesGuard } from './guards/roles.guard';
import { Role } from './enums/role.enum';
import { Roles } from './decorators/roles.decorator';

// Add interface to extend Express Request
interface AuthRequest extends Request {
    user: any; // Or define a proper User type
}

@Controller('auth')
@UseInterceptors(LoggingInterceptor)
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    async register(@Req() req: Request, @Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto, req);
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
        return this.authService.forgotPassword(dto.email);
    }

    @Post('verify-otp')
    async verifyOTP(@Body() dto: VerifyOTPDto) {
        return this.authService.verifyOTP(dto.email, dto.otp);
    }

    @Post('reset-password')
    async resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto);
    }

    // Admin only routes
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Get('sessions')
    async getAllSessions() {
        return this.authService.getAllSessions();
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Delete('sessions/:id')
    async terminateSession(@Param('id') sessionId: string) {
        return this.authService.terminateSession(sessionId);
    }

    // OAuth routes
    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth() { }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req: AuthRequest) {
        return this.authService.validateOAuthLogin(req.user, 'google');
    }

    @Get('facebook')
    @UseGuards(AuthGuard('facebook'))
    async facebookAuth() { }

    @Get('facebook/callback')
    @UseGuards(AuthGuard('facebook'))
    async facebookAuthRedirect(@Req() req: AuthRequest) {
        return this.authService.validateOAuthLogin(req.user, 'facebook');
    }
}