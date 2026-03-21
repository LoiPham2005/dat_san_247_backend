import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PayoutService } from '../payout.service';
import { WalletService } from '../wallet.service';
import { CommissionService } from '../commission.service';
import { ResponseUtil } from '../../../common/utils/response.util';

@Controller('owner/finance')
@UseGuards(JwtAuthGuard)
export class OwnerController {
    constructor(
        private readonly payoutService: PayoutService,
        private readonly walletService: WalletService,
        private readonly commissionService: CommissionService
    ) {}

    @Get('wallet')
    async getWallet(@Req() req: any) {
        const wallet = await this.walletService.getWallet(req.user.id);
        return ResponseUtil.success(wallet);
    }

    @Get('bank-accounts')
    async getBankAccounts(@Req() req: any) {
        const accounts = await this.payoutService.getBankAccounts(req.user.id);
        return ResponseUtil.success(accounts);
    }

    @Post('bank-accounts')
    async addBankAccount(@Req() req: any, @Body() data: any) {
        const account = await this.payoutService.addBankAccount(req.user.id, data);
        return ResponseUtil.success(account, 'Đã thêm tài khoản ngân hàng thành công');
    }

    @Delete('bank-accounts/:id')
    async deleteBankAccount(@Req() req: any, @Param('id') id: string) {
        await this.payoutService.deleteBankAccount(req.user.id, id);
        return ResponseUtil.success(null, 'Đã xóa tài khoản ngân hàng');
    }

    @Get('payouts')
    async getPayoutRequests(@Req() req: any) {
        const payouts = await this.payoutService.getPayoutRequests(req.user.id);
        return ResponseUtil.success(payouts);
    }

    @Post('payouts')
    async createPayoutRequest(@Req() req: any, @Body() data: { amount: number, bank_account_id: string }) {
        const payout = await this.payoutService.createPayoutRequest(req.user.id, data.amount, data.bank_account_id);
        return ResponseUtil.success(payout, 'Đã gửi yêu cầu rút tiền thành công');
    }

    @Get('stats')
    async getStats(@Req() req: any, @Query('venue_id') venueId: string) {
        const stats = await this.commissionService.getFinancialStats(req.user.id, venueId);
        return ResponseUtil.success(stats);
    }

    @Get('commissions')
    async getCommissions(@Req() req: any, @Query('venue_id') venueId: string) {
        const commissions = await this.commissionService.getVenueCommissions(req.user.id, venueId);
        return ResponseUtil.success(commissions);
    }
}
