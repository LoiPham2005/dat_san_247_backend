import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiSuccessResponse } from '../../common/decorators/api-response.decorator';

@ApiTags('Client - Wallet')
@ApiBearerAuth()
@Controller('wallet')
export class WalletController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Get('balance')
    @ApiOperation({ summary: 'Lấy số dư ví' })
    @ApiSuccessResponse()
    async getBalance(@CurrentUser('id') userId: string) {
        // Giả sử có wallet service hoặc dùng user service
        return { balance: 0 };
    }

    @Get('transactions')
    @ApiOperation({ summary: 'Lịch sử giao dịch ví' })
    @ApiSuccessResponse()
    async getTransactions(@CurrentUser('id') userId: string) {
        return this.paymentsService.getWalletHistory(userId);
    }

    @Post('top-up')
    @ApiOperation({ summary: 'Nạp tiền vào ví (Khởi tạo giao dịch)' })
    @ApiSuccessResponse()
    async topUp(@CurrentUser('id') userId: string, @Body() data: any) {
        return this.paymentsService.createTopUpTransaction(userId, data);
    }
}
