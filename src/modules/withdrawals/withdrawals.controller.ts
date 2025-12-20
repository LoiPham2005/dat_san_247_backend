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
import { WithdrawalsService } from './withdrawal.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { UpdateWithdrawalDto } from './dto/update-withdrawal.dto';
import { WithdrawalFilterDto } from './dto/withdrawal-filter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Withdrawals')
@Controller('withdrawals')
export class WithdrawalsController {
  constructor(private withdrawalsService: WithdrawalsService) { }

  // =====================================================
  // VENUE OWNER - Tạo yêu cầu rút tiền
  // =====================================================
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create withdrawal request' })
  async create(
    @CurrentUser('id') ownerId: string,
    @Body() dto: CreateWithdrawalDto
  ) {
    const withdrawal = await this.withdrawalsService.create(ownerId, dto);
    return {
      success: true,
      message: 'Withdrawal request created successfully',
      data: withdrawal,
    };
  }

  // =====================================================
  // ADMIN - Lấy tất cả yêu cầu rút tiền
  // =====================================================
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all withdrawal requests' })
  async findAll(@Query() filters: WithdrawalFilterDto) {
    const withdrawals = await this.withdrawalsService.findAll(filters);
    return {
      success: true,
      message: 'Withdrawal requests retrieved successfully',
      data: withdrawals,
      total: withdrawals.length,
    };
  }

  // =====================================================
  // ADMIN - Lấy yêu cầu rút tiền theo ID
  // =====================================================
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get withdrawal request by ID' })
  async findOne(@Param('id') id: string) {
    const withdrawal = await this.withdrawalsService.findOne(id);
    return {
      success: true,
      message: 'Withdrawal request retrieved successfully',
      data: withdrawal,
    };
  }

  // =====================================================
  // VENUE OWNER - Lấy yêu cầu rút tiền của mình
  // =====================================================
  @Get('my-withdrawals')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get my withdrawal requests' })
  async getMyWithdrawals(
    @CurrentUser('id') ownerId: string,
    @Query() filters: WithdrawalFilterDto
  ) {
    const withdrawals = await this.withdrawalsService.getOwnerWithdrawals(
      ownerId,
      filters
    );
    return {
      success: true,
      message: 'Your withdrawal requests retrieved successfully',
      data: withdrawals,
      total: withdrawals.length,
    };
  }

  // =====================================================
  // VENUE OWNER - Lấy số dư khả dụng
  // =====================================================
  @Get('available-balance')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get available balance' })
  async getAvailableBalance(@CurrentUser('id') ownerId: string) {
    const balance = await this.withdrawalsService.getAvailableBalance(ownerId);
    return {
      success: true,
      message: 'Available balance retrieved successfully',
      data: { availableBalance: balance },
    };
  }

  // =====================================================
  // ADMIN - Lấy yêu cầu rút tiền chưa xử lý
  // =====================================================
  @Get('pending/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get pending withdrawal requests' })
  async getPendingWithdrawals() {
    const withdrawals = await this.withdrawalsService.getPendingWithdrawals();
    return {
      success: true,
      message: 'Pending withdrawal requests retrieved successfully',
      data: withdrawals,
      total: withdrawals.length,
    };
  }

  // =====================================================
  // ADMIN - Cập nhật yêu cầu rút tiền
  // =====================================================
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update withdrawal request' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateWithdrawalDto
  ) {
    const withdrawal = await this.withdrawalsService.update(id, dto);
    return {
      success: true,
      message: 'Withdrawal request updated successfully',
      data: withdrawal,
    };
  }

  // =====================================================
  // ADMIN - Duyệt yêu cầu rút tiền
  // =====================================================
  @Post(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Approve withdrawal request' })
  async approve(
    @Param('id') id: string,
    @CurrentUser('id') processedBy: string
  ) {
    const withdrawal = await this.withdrawalsService.approve(id, processedBy);
    return {
      success: true,
      message: 'Withdrawal request approved successfully',
      data: withdrawal,
    };
  }

  // =====================================================
  // ADMIN - Duyệt nhiều yêu cầu
  // =====================================================
  @Post('bulk/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Approve multiple withdrawal requests' })
  async approveBulk(
    @Body() body: { ids: string[] },
    @CurrentUser('id') processedBy: string
  ) {
    await this.withdrawalsService.approveBulk(body.ids, processedBy);
    return {
      success: true,
      message: 'Withdrawal requests approved successfully',
    };
  }

  // =====================================================
  // ADMIN - Bắt đầu xử lý
  // =====================================================
  @Post(':id/start-processing')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Start processing withdrawal' })
  async startProcessing(
    @Param('id') id: string,
    @CurrentUser('id') processedBy: string
  ) {
    const withdrawal = await this.withdrawalsService.startProcessing(
      id,
      processedBy
    );
    return {
      success: true,
      message: 'Withdrawal processing started successfully',
      data: withdrawal,
    };
  }

  // =====================================================
  // ADMIN - Hoàn tất rút tiền
  // =====================================================
  @Post(':id/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Complete withdrawal' })
  async complete(
    @Param('id') id: string,
    @Body() body: { transferReference: string }
  ) {
    const withdrawal = await this.withdrawalsService.complete(
      id,
      body.transferReference
    );
    return {
      success: true,
      message: 'Withdrawal completed successfully',
      data: withdrawal,
    };
  }

  // =====================================================
  // ADMIN - Từ chối yêu cầu rút tiền
  // =====================================================
  @Post(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Reject withdrawal request' })
  async reject(
    @Param('id') id: string,
    @CurrentUser('id') processedBy: string,
    @Body() body: { rejectionReason: string }
  ) {
    const withdrawal = await this.withdrawalsService.reject(
      id,
      body.rejectionReason,
      processedBy
    );
    return {
      success: true,
      message: 'Withdrawal request rejected successfully',
      data: withdrawal,
    };
  }

  // =====================================================
  // VENUE OWNER - Hủy yêu cầu rút tiền
  // =====================================================
  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Cancel withdrawal request' })
  async cancel(@Param('id') id: string, @CurrentUser('id') ownerId: string) {
    const withdrawal = await this.withdrawalsService.findOne(id);

    if (withdrawal.ownerId !== ownerId) {
      throw new Error('Unauthorized');
    }

    const result = await this.withdrawalsService.cancel(id);
    return {
      success: true,
      message: 'Withdrawal request cancelled successfully',
      data: result,
    };
  }

  // =====================================================
  // ADMIN - Xóa yêu cầu rút tiền
  // =====================================================
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete withdrawal request' })
  async remove(@Param('id') id: string) {
    await this.withdrawalsService.remove(id);
    return {
      success: true,
      message: 'Withdrawal request deleted successfully',
    };
  }

  // =====================================================
  // ADMIN - Thống kê rút tiền
  // =====================================================
  @Get('statistics/overview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get withdrawal statistics' })
  async getStatistics(@Query() filters: WithdrawalFilterDto) {
    const stats = await this.withdrawalsService.getStatistics(filters);
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
  @ApiOperation({ summary: 'Get my withdrawal statistics' })
  async getMyStatistics(@CurrentUser('id') ownerId: string) {
    const stats = await this.withdrawalsService.getOwnerStatistics(ownerId);
    return {
      success: true,
      message: 'Your statistics retrieved successfully',
      data: stats,
    };
  }

  // =====================================================
  // ADMIN - Export withdrawals
  // =====================================================
  @Post('export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Export withdrawal requests' })
  async exportWithdrawals(@Query() filters: WithdrawalFilterDto) {
    const withdrawals = await this.withdrawalsService.exportWithdrawals(filters);
    return {
      success: true,
      message: 'Withdrawal requests exported successfully',
      data: withdrawals,
      total: withdrawals.length,
    };
  }
}