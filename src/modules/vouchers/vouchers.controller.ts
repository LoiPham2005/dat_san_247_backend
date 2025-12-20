// modules/vouchers/vouchers.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VouchersService } from './vouchers.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Vouchers')
@Controller('vouchers')
export class VouchersController {
  constructor(private vouchersService: VouchersService) {}

  @Get('available')
  @Public()
  @ApiOperation({ summary: 'Get available vouchers' })
  async getAvailable() {
    return this.vouchersService.findAvailableVouchers();
  }

  @Post('validate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validate voucher' })
  async validate(
    @CurrentUser('id') userId: string,
    @Body() body: {
      voucherCode: string;
      orderAmount: number;
      venueId?: string;
      sportTypeId?: string;
    },
  ) {
    return this.vouchersService.validateVoucher(
      body.voucherCode,
      userId,
      body.orderAmount,
      body.venueId,
      body.sportTypeId,
    );
  }

  @Get('my-usage')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my voucher usage history' })
  async getMyUsage(@CurrentUser('id') userId: string) {
    return this.vouchersService.getUserVoucherUsage(userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create voucher (Admin only)' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() createVoucherDto: CreateVoucherDto,
  ) {
    return this.vouchersService.create(userId, createVoucherDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate voucher (Admin only)' })
  async deactivate(@Param('id') id: string) {
    await this.vouchersService.deactivateVoucher(id);
    return { message: 'Voucher deactivated' };
  }
}
