import { Controller, Post, Body, Headers, UnauthorizedException, Logger, HttpCode } from '@nestjs/common';
import { BankTransferService, SEPAY_API_KEY } from '../bank-transfer.service';

@Controller('payments/webhook')
export class WebhookController {
    private readonly logger = new Logger(WebhookController.name);

    constructor(private readonly bankTransferService: BankTransferService) {}

    /**
     * Webhook từ SePay — gọi khi có giao dịch ngân hàng mới.
     * SePay gửi apiKey trong body để xác thực.
     * Docs: https://docs.sepay.vn/webhook
     */
    @Post('sepay')
    @HttpCode(200)
    async handleSepayWebhook(@Body() body: {
        id: number;
        gateway: string;
        transactionDate: string;
        accountNumber: string;
        subAccount?: string;
        code?: string;
        content: string;
        transferType: string;
        transferAmount: number;
        accumulated?: number;
        referenceCode?: string;
        description?: string;
        apiKey?: string;
    }) {
        // Verify SePay API key
        if (SEPAY_API_KEY && body.apiKey !== SEPAY_API_KEY) {
            this.logger.warn(`SePay webhook: Invalid apiKey`);
            throw new UnauthorizedException('Invalid API key');
        }

        this.logger.log(`SePay webhook: ${body.transferType} ${body.transferAmount}đ — "${body.content}"`);

        const result = await this.bankTransferService.handleSepayWebhook(body);
        return { ok: true, ...result };
    }
}
