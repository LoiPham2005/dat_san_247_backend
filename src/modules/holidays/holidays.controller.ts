import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HolidaysService } from './holidays.service';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { Public } from '../../common/decorators/public.decorator';
import { HolidayFilterDto } from './dto/holiday-filter.dto';

@ApiTags('Holidays')
@Controller('holidays')
export class HolidaysController {
  constructor(private holidaysService: HolidaysService) { }

  // =====================================================
  // PUBLIC - Kiểm tra ngày có phải ngày lễ
  // =====================================================
  @Get('check/:date')
  @Public()
  @ApiOperation({ summary: 'Check if date is holiday' })
  async checkHoliday(@Param('date') date: string) {
    const holiday = await this.holidaysService.isHoliday(new Date(date));
    return {
      success: true,
      message: 'Holiday check completed',
      data: {
        date,
        isHoliday: !!holiday,
        holiday: holiday || null,
      },
    };
  }

  // =====================================================
  // PUBLIC - Lấy giá nhân ngày lễ
  // =====================================================
  @Get('price-multiplier/:date')
  @Public()
  @ApiOperation({ summary: 'Get holiday price multiplier' })
  async getPriceMultiplier(@Param('date') date: string) {
    const multiplier = await this.holidaysService.getHolidayPriceMultiplier(
      new Date(date)
    );
    return {
      success: true,
      message: 'Price multiplier retrieved successfully',
      data: { date, multiplier },
    };
  }

  // =====================================================
  // PUBLIC - Lấy ngày lễ sắp tới
  // =====================================================
  @Get('upcoming')
  @Public()
  @ApiOperation({ summary: 'Get upcoming holidays' })
  async getUpcomingHolidays(@Query('days') days?: string) {
    const holidays = await this.holidaysService.getUpcomingHolidays(
      days ? parseInt(days) : 30
    );
    return {
      success: true,
      message: 'Upcoming holidays retrieved successfully',
      data: holidays,
      total: holidays.length,
    };
  }

  // =====================================================
  // PUBLIC - Lấy ngày lễ trong năm
  // =====================================================
  @Get('year/:year')
  @Public()
  @ApiOperation({ summary: 'Get holidays by year' })
  async getHolidaysByYear(@Param('year') year: string) {
    const holidays = await this.holidaysService.getHolidaysByYear(
      parseInt(year)
    );
    return {
      success: true,
      message: 'Holidays retrieved successfully',
      data: holidays,
      total: holidays.length,
    };
  }

  // =====================================================
  // PUBLIC - Lấy ngày lễ trong tháng
  // =====================================================
  @Get('month/:year/:month')
  @Public()
  @ApiOperation({ summary: 'Get holidays by month' })
  async getHolidaysByMonth(
    @Param('year') year: string,
    @Param('month') month: string
  ) {
    const holidays = await this.holidaysService.getHolidaysByMonth(
      parseInt(year),
      parseInt(month)
    );
    return {
      success: true,
      message: 'Holidays retrieved successfully',
      data: holidays,
      total: holidays.length,
    };
  }

  // =====================================================
  // ADMIN - Tạo ngày lễ mới
  // =====================================================
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create new holiday' })
  async create(@Body() dto: CreateHolidayDto) {
    const holiday = await this.holidaysService.create(dto);
    return {
      success: true,
      message: 'Holiday created successfully',
      data: holiday,
    };
  }

  // =====================================================
  // ADMIN - Tạo ngày lễ lặp lại
  // =====================================================
  @Post('recurring')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create recurring holiday' })
  async createRecurring(
    @Body() dto: CreateHolidayDto,
    @Query('years') years?: string
  ) {
    const holidays = await this.holidaysService.createRecurringHoliday(
      dto,
      years ? parseInt(years) : 5
    );
    return {
      success: true,
      message: 'Recurring holiday created successfully',
      data: holidays,
      total: holidays.length,
    };
  }

  // =====================================================
  // ADMIN - Nhập ngày lễ hàng loạt
  // =====================================================
  @Post('bulk/import')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Bulk import holidays' })
  async bulkImport(@Body() body: { holidays: CreateHolidayDto[] }) {
    const created = await this.holidaysService.bulkCreate(body.holidays);
    return {
      success: true,
      message: 'Holidays imported successfully',
      data: created,
      total: created.length,
    };
  }

  // =====================================================
  // ADMIN - Lấy tất cả ngày lễ
  // =====================================================
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all holidays' })
  async findAll(@Query() filters: HolidayFilterDto) {
    const holidays = await this.holidaysService.findAll(filters);
    return {
      success: true,
      message: 'Holidays retrieved successfully',
      data: holidays,
      total: holidays.length,
    };
  }

  // =====================================================
  // ADMIN - Lấy ngày lễ theo ID
  // =====================================================
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get holiday by ID' })
  async findOne(@Param('id') id: string) {
    const holiday = await this.holidaysService.findOne(id);
    return {
      success: true,
      message: 'Holiday retrieved successfully',
      data: holiday,
    };
  }

  // =====================================================
  // ADMIN - Cập nhật ngày lễ
  // =====================================================
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update holiday' })
  async update(@Param('id') id: string, @Body() dto: UpdateHolidayDto) {
    const holiday = await this.holidaysService.update(id, dto);
    return {
      success: true,
      message: 'Holiday updated successfully',
      data: holiday,
    };
  }

  // =====================================================
  // ADMIN - Bật/Tắt ngày lễ
  // =====================================================
  @Put(':id/toggle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Toggle holiday active status' })
  async toggleActive(@Param('id') id: string) {
    const holiday = await this.holidaysService.toggleActive(id);
    return {
      success: true,
      message: 'Holiday status toggled successfully',
      data: holiday,
    };
  }

  // =====================================================
  // ADMIN - Kích hoạt ngày lễ
  // =====================================================
  @Post(':id/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Activate holiday' })
  async activate(@Param('id') id: string) {
    const holiday = await this.holidaysService.activate(id);
    return {
      success: true,
      message: 'Holiday activated successfully',
      data: holiday,
    };
  }

  // =====================================================
  // ADMIN - Vô hiệu hóa ngày lễ
  // =====================================================
  @Post(':id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Deactivate holiday' })
  async deactivate(@Param('id') id: string) {
    const holiday = await this.holidaysService.deactivate(id);
    return {
      success: true,
      message: 'Holiday deactivated successfully',
      data: holiday,
    };
  }

  // =====================================================
  // ADMIN - Xóa ngày lễ
  // =====================================================
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete holiday' })
  async remove(@Param('id') id: string) {
    await this.holidaysService.remove(id);
    return {
      success: true,
      message: 'Holiday deleted successfully',
    };
  }

  // =====================================================
  // ADMIN - Statistics
  // =====================================================
  @Get('statistics/overview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get holiday statistics' })
  async getStatistics() {
    const stats = await this.holidaysService.getStatistics();
    return {
      success: true,
      message: 'Statistics retrieved successfully',
      data: stats,
    };
  }

  // =====================================================
  // ADMIN - Export holidays
  // =====================================================
  @Post('export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Export holidays' })
  async exportHolidays(@Query() filters: HolidayFilterDto) {
    const holidays = await this.holidaysService.exportHolidays(filters);
    return {
      success: true,
      message: 'Holidays exported successfully',
      data: holidays,
      total: holidays.length,
    };
  }

  // =====================================================
  // ADMIN - Count holidays in range
  // =====================================================
  @Get('count-range')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Count holidays in date range' })
  async countHolidaysInRange(
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string
  ) {
    const count = await this.holidaysService.countHolidaysInRange(
      new Date(fromDate),
      new Date(toDate)
    );
    return {
      success: true,
      message: 'Holiday count retrieved successfully',
      data: { fromDate, toDate, count },
    };
  }

  // =====================================================
  // ADMIN - Get recurring holiday names
  // =====================================================
  @Get('recurring/names')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get recurring holiday names' })
  async getRecurringHolidayNames() {
    const names = await this.holidaysService.getRecurringHolidayNames();
    return {
      success: true,
      message: 'Recurring holiday names retrieved successfully',
      data: names,
      total: names.length,
    };
  }
}