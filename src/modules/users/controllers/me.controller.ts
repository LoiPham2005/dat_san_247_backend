import { Controller, Get, Patch, Body, Post, UseGuards, Req } from '@nestjs/common';
import { UsersService } from '../users.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UpdatePasswordDto } from '../dto/update-password.dto';
import { UpdateNotificationSettingsDto } from '../dto/update-notification-settings.dto';
import { UpsertSportPreferenceDto } from '../dto/upsert-sport-preference.dto';

@Controller('users/me')
@UseGuards(JwtAuthGuard)
export class MeController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @ResponseMessage('Profile retrieved successfully')
    async getProfile(@Req() req) {
        return this.usersService.findById(req.user.id);
    }

    @Patch('profile')
    @ResponseMessage('Profile updated successfully')
    async updateProfile(@Req() req, @Body() dto: UpdateProfileDto) {
        return this.usersService.updateProfile(req.user.id, dto);
    }

    @Patch('password')
    @ResponseMessage('Password updated successfully')
    async updatePassword(@Req() req, @Body() dto: UpdatePasswordDto) {
        return this.usersService.updatePassword(req.user.id, dto);
    }

    @Patch('notifications')
    @ResponseMessage('Notification settings updated successfully')
    async updateNotificationSettings(@Req() req, @Body() dto: UpdateNotificationSettingsDto) {
        return this.usersService.updateNotificationSettings(req.user.id, dto);
    }

    @Post('sport-preferences')
    @ResponseMessage('Sport preferences updated successfully')
    async upsertSportPreference(@Req() req, @Body() dto: UpsertSportPreferenceDto) {
        return this.usersService.upsertSportPreference(req.user.id, dto);
    }
}
