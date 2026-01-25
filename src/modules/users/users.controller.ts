import { Controller, Get, Put, Body, UseGuards, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiSuccessResponse } from '../../common/decorators/api-response.decorator';
import { User } from './entities/user.entity';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Client - Profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  @ApiOperation({ summary: 'Lấy thông tin cá nhân của tôi' })
  @ApiSuccessResponse(User)
  async getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.findOne(userId);
  }

  @Put()
  @ApiOperation({ summary: 'Cập nhật thông tin cá nhân' })
  @ApiSuccessResponse(User)
  async updateProfile(@CurrentUser('id') userId: string, @Body() data: any) {
    return this.usersService.update(userId, data);
  }

  @Patch('change-password')
  @ApiOperation({ summary: 'Đổi mật khẩu' })
  async changePassword(@CurrentUser('id') userId: string, @Body() data: any) {
    return this.usersService.changePassword(userId, data);
  }


  @Patch('fcm-token')
  @ApiOperation({ summary: 'Cập nhật token thông báo (FCM Token)' })
  async updateFcmToken(@CurrentUser('id') userId: string, @Body('fcmToken') fcmToken: string) {
    return this.usersService.update(userId, { fcmToken });
  }
}
