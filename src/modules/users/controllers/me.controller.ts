import { Controller, Get, Patch, Body, Post, UseGuards, Req, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from '../users.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UpdatePasswordDto } from '../dto/update-password.dto';
import { UpdateNotificationSettingsDto } from '../dto/update-notification-settings.dto';
import { UpsertSportPreferenceDto } from '../dto/upsert-sport-preference.dto';
import { StorageService } from '../../../shared/storage/storage.service';
import { ResponseUtil } from '../../../common/utils/response.util';

@Controller('users/me')
@UseGuards(JwtAuthGuard)
export class MeController {
    constructor(
        private readonly usersService: UsersService,
        private readonly storageService: StorageService
    ) { }

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

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: any) {
        if (!file) {
            throw new BadRequestException('Không tìm thấy tệp đính kèm');
        }
        const url = await this.storageService.upload(file, 'profiles');
        return ResponseUtil.success({ url }, 'Đã tải lên tệp thành công');
    }
}
