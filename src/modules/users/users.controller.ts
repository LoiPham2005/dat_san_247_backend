import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiSuccessResponse } from '../../common/decorators/api-response.decorator';
import { User } from './entities/user.entity';

@ApiTags('Client - Profile')
@ApiBearerAuth()
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
}
