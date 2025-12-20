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
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentFilterDto } from './dto/payment-filter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  // =====================================================
  // CREATE - Tạo thanh toán
  // =====================================================
  @Post()
  @ApiOperation({ summary: 'Create payment' })
  async create(@Body() dto: CreatePaymentDto) {
    const payment = await this.paymentsService.create(dto);
    return {
      success: true,
      message: 'Payment created successfully',
      data: payment,
    };
  }

  // =====================================================
  // READ - All Payments
  // =====================================================
  @Get()
  @ApiOperation({ summary: 'Get all payments' })
  async findAll(@Query() filters: PaymentFilterDto) {
    const payments = await this.paymentsService.findAll(filters);
    return {
      success: true,
      message: 'Payments retrieved successfully',
      data: payments,
      total: payments.length,
    };
  }

  // =====================================================
  // READ - Payment by ID
  // =====================================================
  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  async findOne(@Param('id') id: string) {
    const payment = await this.paymentsService.findOne(id);
    return {
      success: true,
      message: 'Payment retrieved successfully',
      data: payment,
    };
  }

  // =====================================================
  // READ - My Payments
  // =====================================================
  @Get('my-payments')
  @ApiOperation({ summary: 'Get my payments' })
  async getMyPayments(
    @CurrentUser('id') userId: string,
    @Query() filters: PaymentFilterDto,
  ) {
    const payments = await this.paymentsService.findByUser(userId, filters);
    return {
      success: true,
      message: 'Your payments retrieved successfully',
      data: payments,
      total: payments.length,
    };
  }

  // =====================================================
  // READ - Booking Payments
  // =====================================================
  @Get('booking/:bookingId')
  @ApiOperation({ summary: 'Get payments by booking' })
  async getBookingPayments(@Param('bookingId') bookingId: string) {
    const payments = await this.paymentsService.findByBooking(bookingId);
    return {
      success: true,
      message: 'Booking payments retrieved successfully',
      data: payments,
      total: payments.length,
    };
  }

  // =====================================================
  // UPDATE - Update Payment
  // =====================================================
  @Put(':id')
  @ApiOperation({ summary: 'Update payment' })
  async update(@Param('id') id: string, @Body() dto: UpdatePaymentDto) {
    const payment = await this.paymentsService.update(id, dto);
    return {
      success: true,
      message: 'Payment updated successfully',
      data: payment,
    };
  }

  // =====================================================
  // DELETE - Delete Payment
  // =====================================================
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete payment' })
  async remove(@Param('id') id: string) {
    await this.paymentsService.remove(id);
    return {
      success: true,
      message: 'Payment deleted successfully',
    };
  }

  // =====================================================
  // VNPAY - Tạo thanh toán VNPay
  // =====================================================
  @Post('vnpay/create')
  @ApiOperation({ summary: 'Create VNPay payment' })
  async createVnpayPayment(
    @CurrentUser('id') userId: string,
    @Body()
    body: {
      bookingId: string;
      returnUrl: string;
    },
  ) {
    const result = await this.paymentsService.createVnpayPayment(
      body.bookingId,
      userId,
      body.returnUrl,
    );
    return {
      success: true,
      message: 'VNPay payment created successfully',
      data: result,
    };
  }

  // =====================================================
  // VNPAY - Callback
  // =====================================================
  @Get('vnpay/callback')
  @Public()
  @ApiOperation({ summary: 'VNPay callback' })
  async vnpayCallback(@Req() req: any) {
    try {
      const payment = await this.paymentsService.verifyVnpayCallback(req.query);
      return {
        success: true,
        message: 'Payment verified successfully',
        data: payment,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // =====================================================
  // MOMO - Tạo thanh toán MoMo
  // =====================================================
  @Post('momo/create')
  @ApiOperation({ summary: 'Create MoMo payment' })
  async createMomoPayment(
    @CurrentUser('id') userId: string,
    @Body()
    body: {
      bookingId: string;
      returnUrl: string;
    },
  ) {
    const result = await this.paymentsService.createMomoPayment(
      body.bookingId,
      userId,
      body.returnUrl,
    );
    return {
      success: true,
      message: 'MoMo payment created successfully',
      data: result,
    };
  }

  // =====================================================
  // MOMO - Callback
  // =====================================================
  @Post('momo/callback')
  @Public()
  @ApiOperation({ summary: 'MoMo callback' })
  async momoCallback(@Body() body: any) {
    try {
      const payment = await this.paymentsService.verifyMomoCallback(body);
      return {
        success: true,
        message: 'Payment verified successfully',
        data: payment,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // =====================================================
  // ZALOPAY - Tạo thanh toán ZaloPay
  // =====================================================
  @Post('zalopay/create')
  @ApiOperation({ summary: 'Create ZaloPay payment' })
  async createZaloPayment(
    @CurrentUser('id') userId: string,
    @Body()
    body: {
      bookingId: string;
      returnUrl: string;
    },
  ) {
    const result = await this.paymentsService.createZaloPayment(
      body.bookingId,
      userId,
      body.returnUrl,
    );
    return {
      success: true,
      message: 'ZaloPay payment created successfully',
      data: result,
    };
  }

  // =====================================================
  // BANK TRANSFER - Tạo yêu cầu chuyển khoản
  // =====================================================
  @Post('bank-transfer/create')
  @ApiOperation({ summary: 'Create bank transfer request' })
  async createBankTransfer(
    @CurrentUser('id') userId: string,
    @Body() body: { bookingId: string },
  ) {
    const payment = await this.paymentsService.createBankTransfer(
      body.bookingId,
      userId,
    );
    return {
      success: true,
      message: 'Bank transfer request created',
      data: payment,
    };
  }

  // =====================================================
  // CASH - Tạo thanh toán tiền mặt
  // =====================================================
  @Post('cash/create')
  @ApiOperation({ summary: 'Create cash payment' })
  async createCashPayment(
    @CurrentUser('id') userId: string,
    @Body() body: { bookingId: string },
  ) {
    const payment = await this.paymentsService.createCashPayment(
      body.bookingId,
      userId,
    );
    return {
      success: true,
      message: 'Cash payment created',
      data: payment,
    };
  }

  // =====================================================
  // CASH - Xác nhận thanh toán tiền mặt
  // =====================================================
  @Post(':id/cash/confirm')
  @ApiOperation({ summary: 'Confirm cash payment' })
  async confirmCashPayment(@Param('id') id: string) {
    const payment = await this.paymentsService.confirmCashPayment(id);
    return {
      success: true,
      message: 'Cash payment confirmed',
      data: payment,
    };
  }

  // =====================================================
  // REFUND - Hoàn tiền
  // =====================================================
  @Post(':id/refund')
  @ApiOperation({ summary: 'Refund payment' })
  async refundPayment(
    @Param('id') id: string,
    @Body() body: { reason: string },
  ) {
    const payment = await this.paymentsService.refundPayment(id, body.reason);
    return {
      success: true,
      message: 'Payment refunded successfully',
      data: payment,
    };
  }

  // =====================================================
  // STATISTICS - Thống kê thanh toán
  // =====================================================
  @Get('statistics/overview')
  @ApiOperation({ summary: 'Get payment statistics' })
  async getStatistics(@Query() filters: PaymentFilterDto) {
    const stats = await this.paymentsService.getPaymentStatistics(filters);
    return {
      success: true,
      message: 'Payment statistics retrieved successfully',
      data: stats,
    };
  }
}