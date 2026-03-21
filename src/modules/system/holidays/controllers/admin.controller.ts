import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { UserRole } from '../../../../common/constants/role.constant';
import { HolidaysService } from '../holidays.service';

@Controller('admin/holidays')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminController {
    constructor(private holidaysService: HolidaysService) {}

    @Get()
    getAllHolidays() {
        return this.holidaysService.getAllHolidays();
    }

    @Post()
    createHoliday(@Body() data: any) {
        return this.holidaysService.createHoliday(data);
    }

    @Patch(':id')
    updateHoliday(@Param('id') id: string, @Body() data: any) {
        return this.holidaysService.updateHoliday(id, data);
    }

    @Delete(':id')
    deleteHoliday(@Param('id') id: string) {
        return this.holidaysService.deleteHoliday(id);
    }
}
