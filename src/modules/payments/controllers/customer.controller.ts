import { Controller, Get, Post, UseGuards, Req, Body, Param, BadRequestException, NotFoundException } from '@nestjs/common';
import { WalletService } from '../wallet.service';
import { TransactionService } from '../transaction.service';
import { InvoiceService } from '../invoice.service';
import { BankTransferService } from '../bank-transfer.service';
import { VNPayGateway } from '../gateways/vnpay.gateway';
import { MoMoGateway } from '../gateways/momo.gateway';
import { ZaloPayGateway } from '../gateways/zalopay.gateway';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ResponseUtil } from '../../../common/utils/response.util';
import { PrismaService } from '../../../prisma/prisma.service';

@Controller('customer')
@UseGuards(JwtAuthGuard)
export class CustomerController {
    constructor(
        private readonly walletService: WalletService,
        private readonly transactionService: TransactionService,
        private readonly invoiceService: InvoiceService,
        private readonly bankTransferService: BankTransferService,
        private readonly vnpayGateway: VNPayGateway,
        private readonly momoGateway: MoMoGateway,
        private readonly zalopayGateway: ZaloPayGateway,
        private readonly prisma: PrismaService,
    ) {}

    @Get('wallet')
    async getWallet(@Req() req: any) {
        const wallet = await this.walletService.getWallet(req.user.id);
        return ResponseUtil.success(wallet);
    }

    @Get('transactions')
    async getTransactions(@Req() req: any) {
        const transactions = await this.transactionService.getTransactions(req.user.id);
        return ResponseUtil.success(transactions);
    }

    @Get('invoices')
    async getInvoices(@Req() req: any) {
        const invoices = await this.invoiceService.getInvoices(req.user.id);
        return ResponseUtil.success(invoices);
    }

    // Thông tin ngân hàng chủ sân
    @Get('venue-bank-info/:venueId')
    async getVenueBankInfo(@Param('venueId') venueId: string) {
        const data = await this.bankTransferService.getVenueBankInfo(venueId);
        return ResponseUtil.success(data);
    }

    // Thông tin QR + bank sau khi booking tạo
    @Get('bank-transfer/:bookingCode')
    async getBankTransferInfo(@Param('bookingCode') bookingCode: string, @Req() req: any) {
        const data = await this.bankTransferService.getBankTransferInfo(bookingCode, req.user.id);
        return ResponseUtil.success(data);
    }

    // Polling: kiểm tra trạng thái thanh toán
    @Get('payment-status/:bookingCode')
    async getPaymentStatus(@Param('bookingCode') bookingCode: string) {
        const data = await this.bankTransferService.getPaymentStatus(bookingCode);
        return ResponseUtil.success(data);
    }

    /**
     * Tạo URL thanh toán VNPay cho một booking
     * Frontend redirect user sang URL này
     */
    @Post('vnpay/create-payment')
    async createVNPayPayment(
        @Body() body: { booking_code: string },
        @Req() req: any,
    ) {
        const { booking_code } = body;
        if (!booking_code) throw new BadRequestException('booking_code là bắt buộc');

        const booking = await this.prisma.bookings.findFirst({
            where: {
                booking_code,
                customer_id: req.user.id,
                deleted_at: null,
            },
            include: { venues: { select: { name: true } } },
        });

        if (!booking) throw new NotFoundException('Không tìm thấy booking');
        if (booking.payment_status === 'PAID') throw new BadRequestException('Booking này đã được thanh toán');

        const ipAddr =
            req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
            req.connection?.remoteAddress ||
            '127.0.0.1';

        const result = await this.vnpayGateway.createPaymentUrl({
            bookingCode: booking_code,
            amount: Number(booking.total_amount),
            orderInfo: `Dat san ${booking.venues?.name || ''} - ${booking_code}`,
            ipAddr,
        });

        // Lưu payment record
        await this.prisma.payments.upsert({
            where: { gateway_txn_id: `VNPAY_${booking_code}` },
            update: { status: 'PENDING', updated_at: new Date() },
            create: {
                booking_id: booking.id,
                gateway_txn_id: `VNPAY_${booking_code}`,
                amount: booking.total_amount,
                payment_method: 'VNPAY',
                status: 'PENDING',
            },
        });

        return ResponseUtil.success({
            payment_url: result.payment_url,
            txn_ref: result.txn_ref,
            amount: Number(booking.total_amount),
            booking_code,
        });
    }

    /**
     * Tạo URL thanh toán MoMo cho một booking
     */
    @Post('momo/create-payment')
    async createMoMoPayment(
        @Body() body: { booking_code: string },
        @Req() req: any,
    ) {
        const { booking_code } = body;
        if (!booking_code) throw new BadRequestException('booking_code là bắt buộc');

        const booking = await this.prisma.bookings.findFirst({
            where: { booking_code, customer_id: req.user.id, deleted_at: null },
            include: { venues: { select: { name: true } } },
        });

        if (!booking) throw new NotFoundException('Không tìm thấy booking');
        if (booking.payment_status === 'PAID') throw new BadRequestException('Booking này đã được thanh toán');

        const result = await this.momoGateway.createPaymentUrl({
            bookingCode: booking_code,
            amount: Number(booking.total_amount),
            orderInfo: `Dat san ${booking.venues?.name || ''} - ${booking_code}`,
        });

        await this.prisma.payments.upsert({
            where: { gateway_txn_id: `MOMO_${booking_code}` },
            update: { status: 'PENDING', updated_at: new Date() },
            create: {
                booking_id: booking.id,
                gateway_txn_id: `MOMO_${booking_code}`,
                amount: booking.total_amount,
                payment_method: 'MOMO',
                status: 'PENDING',
            },
        });

        return ResponseUtil.success({
            payment_url: result.payment_url,
            order_id: result.order_id,
            amount: Number(booking.total_amount),
            booking_code,
        });
    }

    /**
     * Verify kết quả trả về từ MoMo (sau khi user hoàn tất thanh toán)
     */
    @Post('momo/verify-return')
    async verifyMoMoReturn(@Body() query: Record<string, string>) {
        const result = this.momoGateway.verifyReturn(query);

        if (!result.isValid) {
            return ResponseUtil.success({ status: 'INVALID', message: 'Chữ ký không hợp lệ' });
        }

        const booking = await this.prisma.bookings.findFirst({
            where: { booking_code: result.orderId, deleted_at: null },
        });

        if (!booking) {
            return ResponseUtil.success({ status: 'NOT_FOUND', message: 'Không tìm thấy booking' });
        }

        return ResponseUtil.success({
            status: result.isSuccess ? 'SUCCESS' : 'FAILED',
            booking_code: result.orderId,
            amount: result.amount,
            payment_status: booking.payment_status,
        });
    }

    /**
     * Tạo URL thanh toán ZaloPay cho một booking
     */
    @Post('zalopay/create-payment')
    async createZaloPayPayment(
        @Body() body: { booking_code: string },
        @Req() req: any,
    ) {
        const { booking_code } = body;
        if (!booking_code) throw new BadRequestException('booking_code là bắt buộc');

        const booking = await this.prisma.bookings.findFirst({
            where: { booking_code, customer_id: req.user.id, deleted_at: null },
            include: { venues: { select: { name: true } } },
        });

        if (!booking) throw new NotFoundException('Không tìm thấy booking');
        if (booking.payment_status === 'PAID') throw new BadRequestException('Booking này đã được thanh toán');

        const result = await this.zalopayGateway.createPaymentUrl({
            bookingCode: booking_code,
            amount: Number(booking.total_amount),
            description: `Dat san ${booking.venues?.name || ''} - ${booking_code}`,
        });

        await this.prisma.payments.upsert({
            where: { gateway_txn_id: `ZALOPAY_${booking_code}` },
            update: { status: 'PENDING', updated_at: new Date() },
            create: {
                booking_id: booking.id,
                gateway_txn_id: `ZALOPAY_${booking_code}`,
                amount: booking.total_amount,
                payment_method: 'ZALOPAY',
                status: 'PENDING',
            },
        });

        return ResponseUtil.success({
            payment_url: result.payment_url,
            app_trans_id: result.app_trans_id,
            amount: Number(booking.total_amount),
            booking_code,
        });
    }

    /**
     * Verify kết quả trả về từ ZaloPay (sau khi user hoàn tất thanh toán)
     */
    @Post('zalopay/verify-return')
    async verifyZaloPayReturn(@Body() query: Record<string, string>) {
        const result = this.zalopayGateway.verifyReturn(query);

        if (!result.isValid) {
            return ResponseUtil.success({ status: 'INVALID', message: 'Chữ ký không hợp lệ' });
        }

        const booking = await this.prisma.bookings.findFirst({
            where: { booking_code: result.appTransId, deleted_at: null },
        });

        if (!booking) {
            return ResponseUtil.success({ status: 'NOT_FOUND', message: 'Không tìm thấy booking' });
        }

        return ResponseUtil.success({
            status: result.isSuccess ? 'SUCCESS' : 'FAILED',
            booking_code: result.appTransId,
            amount: result.amount,
            payment_status: booking.payment_status,
        });
    }

    /**
     * Verify kết quả trả về từ VNPay (sau khi user hoàn tất thanh toán)
     * Frontend gọi endpoint này với query params từ VNPay redirect
     */
    @Post('vnpay/verify-return')
    async verifyVNPayReturn(@Body() query: Record<string, string>) {
        const result = this.vnpayGateway.verifyReturn(query);

        if (!result.isValid) {
            return ResponseUtil.success({ status: 'INVALID', message: 'Chữ ký không hợp lệ' });
        }

        const booking = await this.prisma.bookings.findFirst({
            where: { booking_code: result.txnRef, deleted_at: null },
        });

        if (!booking) {
            return ResponseUtil.success({ status: 'NOT_FOUND', message: 'Không tìm thấy booking' });
        }

        return ResponseUtil.success({
            status: result.isSuccess ? 'SUCCESS' : 'FAILED',
            booking_code: result.txnRef,
            amount: result.amount,
            payment_status: booking.payment_status,
        });
    }
}
