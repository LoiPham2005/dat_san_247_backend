import { Controller, Get, Patch, Param, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/constants/role.constant';
import { TransactionService } from '../transaction.service';
import { CommissionService } from '../commission.service';
import { PayoutService } from '../payout.service';

@Controller('admin/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminController {
    constructor(
        private transactionService: TransactionService,
        private commissionService: CommissionService,
        private payoutService: PayoutService
    ) { }

    @Get('transactions')
    getTransactions() {
        return this.transactionService.getAllTransactions();
    }

    @Get('commissions')
    getCommissions() {
        return this.commissionService.getAllCommissions();
    }

    @Get('payouts')
    getPayouts() {
        return this.payoutService.getAllPayoutRequests();
    }

    @Patch('payouts/:id')
    updatePayoutStatus(@Param('id') id: string, @Body('status') status: any, @Req() req: any) {
        return this.payoutService.updatePayoutStatus(id, status, req.user.id);
    }
}
