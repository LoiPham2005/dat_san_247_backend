import { Controller, Get, Post, Body, Patch, Param, UseInterceptors, Req, UseGuards } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { EditUserDto } from './dto/edit-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForbiddenException } from '@nestjs/common';
import { AbilityFactory } from 'src/casl/abilities/ability.factory';
import { Roles } from 'src/casl/decorators/roles.decorator';
import { LoggingInterceptor } from 'src/common/interceptors/logging.interceptor';
import { Role } from '../roles/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserNotFoundException } from 'src/common/exceptions/custom-exceptions';
import { fail, success } from 'src/common/helper/response.helper';
import { Action } from 'src/casl/types/casl-types';

@Controller('users')
@UseInterceptors(LoggingInterceptor)
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private abilityFactory: AbilityFactory
    ) { }

    @Get()
    @UseGuards(JwtAuthGuard)
    async getAllUsers() {
        // Only admins can access this
        return this.usersService.findAll();
    }

    @Get('profile/:id')
    async getProfile(@Param('id') id: string) {
        try {
            const user = await this.usersService.findById(Number(id));
            if (!user) {
                throw new UserNotFoundException(id);
            }
            const { password, ...result } = user;
            return success(result, 'Lấy thông tin người dùng thành công');
        } catch (error) {
            return fail(error.message);
        }
    }

    @Get('admin')
    async getAdmin() {
        try {
            const admin = await this.usersService.findAdmin();
            const { password, ...result } = admin;
            return success({
                admin: result,
                message: 'Lấy thông tin admin thành công',
            });
        } catch (error) {
            return fail(error.message);
        }
    }

    @Patch(':id')
    async editUser(@Param('id') id: string, @Body() dto: EditUserDto) {
        try {
            const user = await this.usersService.update(Number(id), dto);
            return success({
                user,
                message: 'Cập nhật thông tin thành công',
            });
        } catch (error) {
            return fail(error.message);
        }
    }

    @Patch(':id/change-password')
    async changePassword(@Param('id') id: string, @Body() dto: ChangePasswordDto) {
        try {
            const result = await this.usersService.changePassword(Number(id), dto);
            return success(result);
        } catch (error) {
            return fail(error.message);
        }
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async getUser(@Param('id') id: string, @Req() req: User) {
        const user = await this.usersService.findOne(+id);
        if (!user) {
            throw new UserNotFoundException(id);
        }

        const ability = this.abilityFactory.createForUser(req);

        if (ability.can(Action.Read, user)) {
            const { password, ...result } = user;
            return success(result, 'Lấy thông tin người dùng thành công');
        }

        throw new ForbiddenException('Không có quyền truy cập thông tin người dùng này');
    }
}
