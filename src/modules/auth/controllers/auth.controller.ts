import { Controller, Post, Body, HttpCode, HttpStatus, UnauthorizedException, Get } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Get('me')
    @ResponseMessage('Fetch current user profile')
    async getMe(@CurrentUser('id') userId: string) {
        return this.authService.getMe(userId);
    }

    @Public()
    @Post('register')
    @ResponseMessage('Registration successful')
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ResponseMessage('Login successful')
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Public()
    @Post('verify-email')
    @HttpCode(HttpStatus.OK)
    async verifyEmail(@Body() dto: VerifyOtpDto) {
        return this.authService.verifyEmail(dto);
    }

    @Public()
    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    async forgotPassword(@Body() dto: ForgotPasswordDto) {
        return this.authService.forgotPassword(dto.email);
    }

    @Public()
    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    async resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto);
    }

    @Public()
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Body('refresh_token') token: string) {
        if (!token) throw new UnauthorizedException('Refresh token is required');
        return this.authService.refresh(token);
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Body('refresh_token') token: string) {
        if (!token) throw new UnauthorizedException('Refresh token is required');
        return this.authService.logout(token);
    }
}
