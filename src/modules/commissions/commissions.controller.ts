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
import { CommissionsService } from './commissions.service';
import { CreateCommissionDto } from './dto/create-commission.dto';
import { UpdateCommissionDto } from './dto/update-commission.dto';
import { CommissionFilterDto } from './dto/commission-filter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Commissions')
@Controller('commissions')
export class CommissionsController {
  constructor(private commissionsService: CommissionsService) { }

  // =====================================================
  // ADMIN - Tạo hoa hồng mới
  // =====================================================
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create new commission' })
  async create(@Body() dto: CreateCommissionDto) {
    const commission = await this.commissionsService.create(dto);
    return {
      success: true,
      message: 'Commission created successfully',
      data: commission,
    };
  }

  // =====================================================
  // ADMIN - Tạo hoa hồng từ booking
  // =====================================================
  @Post('from-booking/:bookingId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create commission from booking' })
  async createFromBooking(
    @Param('bookingId') bookingId: string,
    @Query('rate') rate?: string
  ) {
    const commission = await this.commissionsService.createFromBooking(
      bookingId,
      rate ? parseFloat(rate) : undefined
    );
    return {
      success: true,
      message: 'Commission created from booking successfully',
      data: commission,
    };
  }

  // =====================================================
  // ADMIN - Lấy tất cả hoa hồng
  // =====================================================
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all commissions' })
  async findAll(@Query() filters: CommissionFilterDto) {
    const commissions = await this.commissionsService.findAll(filters);
    return {
      success: true,
      message: 'Commissions retrieved successfully',
      data: commissions,
      total: commissions.length,
    };
  }

  // =====================================================
  // ADMIN - Lấy hoa hồng theo ID
  // =====================================================
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get commission by ID' })
  async findOne(@Param('id') id: string) {
    const commission = await this.commissionsService.findOne(id);
    return {
      success: true,
      message: 'Commission retrieved successfully',
      data: commission,
    };
  }

  // =====================================================
  // VENUE OWNER - Lấy hoa hồng của mình
  // =====================================================
  @Get('my-commissions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get my commissions' })
  async getMyCommissions(
    @CurrentUser('id') ownerId: string,
    @Query() filters: CommissionFilterDto
  ) {
    const commissions = await this.commissionsService.getOwnerCommissions(
      ownerId,
      filters
    );
    return {
      success: true,
      message: 'Your commissions retrieved successfully',
      data: commissions,
      total: commissions.length,
    };
  }

  // =====================================================
  // ADMIN - Lấy hoa hồng chưa duyệt
  // =====================================================
  @Get('pending/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get pending commissions' })
  async getPendingCommissions() {
    const commissions = await this.commissionsService.getPendingCommissions();
    return {
      success: true,
      message: 'Pending commissions retrieved successfully',
      data: commissions,
      total: commissions.length,
    };
  }

  // =====================================================
  // ADMIN - Lấy hoa hồng chưa thanh toán
  // =====================================================
  @Get('unpaid/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get unpaid commissions' })
  async getUnpaidCommissions() {
    const commissions = await this.commissionsService.getUnpaidCommissions();
    return {
      success: true,
      message: 'Unpaid commissions retrieved successfully',
      data: commissions,
      total: commissions.length,
    };
  }

  // =====================================================
  // ADMIN - Cập nhật hoa hồng
  // =====================================================
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update commission' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCommissionDto
  ) {
    const commission = await this.commissionsService.update(id, dto);
    return {
      success: true,
      message: 'Commission updated successfully',
      data: commission,
    };
  }

  // =====================================================
  // ADMIN - Duyệt hoa hồng
  // =====================================================
  @Post(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Approve commission' })
  async approve(@Param('id') id: string) {
    const commission = await this.commissionsService.approve(id);
    return {
      success: true,
      message: 'Commission approved successfully',
      data: commission,
    };
  }

  // =====================================================
  // ADMIN - Duyệt nhiều hoa hồng
  // =====================================================
  @Post('bulk/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Approve multiple commissions' })
  async approveBulk(@Body() body: { ids: string[] }) {
    await this.commissionsService.approveBulk(body.ids);
    return {
      success: true,
      message: 'Commissions approved successfully',
    };
  }

  // =====================================================
  // ADMIN - Thanh toán hoa hồng
  // =====================================================
  @Post(':id/pay')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Pay commission' })
  async pay(@Param('id') id: string) {
    const commission = await this.commissionsService.pay(id);
    return {
      success: true,
      message: 'Commission paid successfully',
      data: commission,
    };
  }

  // =====================================================
  // ADMIN - Thanh toán nhiều hoa hồng
  // =====================================================
  @Post('bulk/pay')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Pay multiple commissions' })
  async payBulk(@Body() body: { ids: string[] }) {
    await this.commissionsService.payBulk(body.ids);
    return {
      success: true,
      message: 'Commissions paid successfully',
    };
  }

  // =====================================================
  // ADMIN - Hủy hoa hồng
  // =====================================================
  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Cancel commission' })
  async cancel(
    @Param('id') id: string,
    @Body() body: { reason?: string }
  ) {
    const commission = await this.commissionsService.cancel(id, body.reason);
    return {
      success: true,
      message: 'Commission cancelled successfully',
      data: commission,
    };
  }

  // =====================================================
  // ADMIN - Xóa hoa hồng
  // =====================================================
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete commission' })
  async remove(@Param('id') id: string) {
    await this.commissionsService.remove(id);
    return {
      success: true,
      message: 'Commission deleted successfully',
    };
  }

  // =====================================================
  // ADMIN - Thống kê hoa hồng
  // =====================================================
  @Get('statistics/overview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get commission statistics' })
  async getStatistics(@Query() filters: CommissionFilterDto) {
    const stats = await this.commissionsService.getStatistics(filters);
    return {
      success: true,
      message: 'Statistics retrieved successfully',
      data: stats,
    };
  }

  // =====================================================
  // VENUE OWNER - Thống kê của tôi
  // =====================================================
  @Get('statistics/my-stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get my commission statistics' })
  async getMyStatistics(@CurrentUser('id') ownerId: string) {
    const stats = await this.commissionsService.getOwnerStatistics(ownerId);
    return {
      success: true,
      message: 'Your statistics retrieved successfully',
      data: stats,
    };
  }

  // =====================================================
  // ADMIN - Export commissions
  // =====================================================
  @Post('export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Export commissions' })
  async exportCommissions(@Query() filters: CommissionFilterDto) {
    const commissions = await this.commissionsService.exportCommissions(filters);
    return {
      success: true,
      message: 'Commissions exported successfully',
      data: commissions,
      total: commissions.length,
    };
  }

  // =====================================================
  // ADMIN - Calculate commission
  // =====================================================
  @Post('calculate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Calculate commission' })
  async calculateCommission(
    @Body() body: { bookingAmount: number; commissionRate: number }
  ) {
    const result = this.commissionsService.calculateCommission(
      body.bookingAmount,
      body.commissionRate
    );
    return {
      success: true,
      message: 'Commission calculated successfully',
      data: result,
    };
  }
}