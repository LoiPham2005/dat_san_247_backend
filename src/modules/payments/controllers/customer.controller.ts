import { Controller, Get, Post, UseGuards, Req, Body } from '@nestjs/common';
import { WalletService } from '../wallet.service';
import { TransactionService } from '../transaction.service';
import { InvoiceService } from '../invoice.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ResponseUtil } from '../../../common/utils/response.util';

@Controller('customer')
@UseGuards(JwtAuthGuard)
export class CustomerController {
    constructor(
        private readonly walletService: WalletService,
        private readonly transactionService: TransactionService,
        private readonly invoiceService: InvoiceService
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
    async deposit(@Body() body: { amount: number, method: string }) {
        // Mock payment URL
        const paymentUrl = `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=${body.amount * 100}&vnp_Command=pay&vnp_CreateDate=20240321`;
        return ResponseUtil.success({ payment_url: paymentUrl });
    }
}
