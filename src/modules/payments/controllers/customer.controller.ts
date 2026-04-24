import { Controller, Get, Post, UseGuards, Req, Body, Param } from '@nestjs/common';
import { WalletService } from '../wallet.service';
import { TransactionService } from '../transaction.service';
import { InvoiceService } from '../invoice.service';
import { BankTransferService } from '../bank-transfer.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ResponseUtil } from '../../../common/utils/response.util';

@Controller('customer')
@UseGuards(JwtAuthGuard)
export class CustomerController {
    constructor(
        private readonly walletService: WalletService,
        private readonly transactionService: TransactionService,
        private readonly invoiceService: InvoiceService,
        private readonly bankTransferService: BankTransferService,
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

    @Post('wallet/deposit')
    async deposit(@Body() body: { amount: number; method: string }) {
        const paymentUrl = `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=${body.amount * 100}&vnp_Command=pay&vnp_CreateDate=20240321`;
        return ResponseUtil.success({ payment_url: paymentUrl });
    }

    // Thông tin ngân hàng chủ sân — hiển thị trên trang checkout trước khi đặt
    @Get('venue-bank-info/:venueId')
    async getVenueBankInfo(@Param('venueId') venueId: string) {
        const data = await this.bankTransferService.getVenueBankInfo(venueId);
        return ResponseUtil.success(data);
    }

    // Thông tin QR + bank sau khi booking tạo (content có booking_code)
    @Get('bank-transfer/:bookingCode')
    async getBankTransferInfo(@Param('bookingCode') bookingCode: string, @Req() req: any) {
        const data = await this.bankTransferService.getBankTransferInfo(bookingCode, req.user.id);
        return ResponseUtil.success(data);
    }

    // Polling: frontend gọi mỗi 4 giây để kiểm tra SePay đã xác nhận chưa
    @Get('payment-status/:bookingCode')
    async getPaymentStatus(@Param('bookingCode') bookingCode: string) {
        const data = await this.bankTransferService.getPaymentStatus(bookingCode);
        return ResponseUtil.success(data);
    }
}
