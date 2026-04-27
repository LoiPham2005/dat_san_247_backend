import { Controller, Post, Body, Get, Query, Headers, UnauthorizedException, Logger, HttpCode } from '@nestjs/common';
import { BankTransferService, SEPAY_API_KEY } from '../bank-transfer.service';
import { VNPayGateway } from '../gateways/vnpay.gateway';
import { MoMoGateway } from '../gateways/momo.gateway';
import { ZaloPayGateway } from '../gateways/zalopay.gateway';
import { PrismaService } from '../../../prisma/prisma.service';

@Controller('payments/webhook')
export class WebhookController {
    private readonly logger = new Logger(WebhookController.name);

    constructor(
        private readonly bankTransferService: BankTransferService,
        private readonly vnpayGateway: VNPayGateway,
        private readonly momoGateway: MoMoGateway,
        private readonly zalopayGateway: ZaloPayGateway,
        private readonly prisma: PrismaService,
    ) {}

    /**
     * Webhook từ SePay — gọi khi có giao dịch ngân hàng mới.
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
        if (SEPAY_API_KEY && body.apiKey !== SEPAY_API_KEY) {
            this.logger.warn(`SePay webhook: Invalid apiKey`);
            throw new UnauthorizedException('Invalid API key');
        }

        this.logger.log(`SePay webhook: ${body.transferType} ${body.transferAmount}đ — "${body.content}"`);
        const result = await this.bankTransferService.handleSepayWebhook(body);
        return { ok: true, ...result };
    }

    /**
     * VNPay IPN — VNPay gọi khi giao dịch hoàn tất (server-to-server).
     * Đây là nguồn xác nhận chính thức, KHÔNG phải return URL.
     */
    @Get('vnpay')
    @HttpCode(200)
    async handleVNPayIpn(@Query() query: Record<string, string>) {
        this.logger.log(`VNPay IPN: txnRef=${query['vnp_TxnRef']} responseCode=${query['vnp_ResponseCode']}`);

        const result = this.vnpayGateway.verifyIpn(query);

        if (!result.isValid) {
            this.logger.warn(`VNPay IPN: chữ ký không hợp lệ cho ${result.txnRef}`);
            return { RspCode: '97', Message: 'Invalid signature' };
        }

        const booking = await this.prisma.bookings.findFirst({
            where: { booking_code: result.txnRef, deleted_at: null },
        });

        if (!booking) {
            this.logger.warn(`VNPay IPN: không tìm thấy booking ${result.txnRef}`);
            return { RspCode: '01', Message: 'Order not found' };
        }

        // Idempotency — tránh xử lý 2 lần
        if (booking.payment_status === 'PAID') {
            return { RspCode: '02', Message: 'Order already confirmed' };
        }

        if (result.isSuccess) {
            await this.prisma.$transaction([
                this.prisma.bookings.update({
                    where: { id: booking.id },
                    data: {
                        payment_status: 'PAID',
                        payment_method: 'VNPAY',
                        paid_at: new Date(),
                        status: 'CONFIRMED',
                    },
                }),
                this.prisma.payments.updateMany({
                    where: { booking_id: booking.id, payment_method: 'VNPAY' },
                    data: {
                        status: 'PAID',
                        paid_at: new Date(),
                        gateway_response: JSON.stringify(query),
                        gateway_txn_id: query['vnp_TransactionNo'] || `VNPAY_${result.txnRef}`,
                    },
                }),
            ]);

            this.logger.log(`VNPay IPN: booking ${result.txnRef} CONFIRMED — ${result.amount.toLocaleString('vi-VN')}đ`);
        } else {
            await this.prisma.payments.updateMany({
                where: { booking_id: booking.id, payment_method: 'VNPAY' },
                data: { status: 'FAILED', gateway_response: JSON.stringify(query) },
            });
            this.logger.warn(`VNPay IPN: booking ${result.txnRef} FAILED — code ${query['vnp_ResponseCode']}`);
        }

        // VNPay yêu cầu trả về đúng format này
        return { RspCode: '00', Message: 'Confirm Success' };
    }

    /**
     * MoMo IPN — MoMo gọi khi giao dịch hoàn tất (server-to-server).
     */
    @Post('momo')
    @HttpCode(200)
    async handleMoMoIpn(@Body() body: Record<string, any>) {
        this.logger.log(`MoMo IPN: orderId=${body['orderId']} resultCode=${body['resultCode']}`);

        const result = this.momoGateway.verifyIpn(body);

        if (!result.isValid) {
            this.logger.warn(`MoMo IPN: chữ ký không hợp lệ cho ${result.orderId}`);
            return { resultCode: 1, message: 'Invalid signature' };
        }

        const booking = await this.prisma.bookings.findFirst({
            where: { booking_code: result.orderId, deleted_at: null },
        });

        if (!booking) {
            this.logger.warn(`MoMo IPN: không tìm thấy booking ${result.orderId}`);
            return { resultCode: 1, message: 'Order not found' };
        }

        if (booking.payment_status === 'PAID') {
            return { resultCode: 0, message: 'Already confirmed' };
        }

        if (result.isSuccess) {
            await this.prisma.$transaction([
                this.prisma.bookings.update({
                    where: { id: booking.id },
                    data: {
                        payment_status: 'PAID',
                        payment_method: 'MOMO',
                        paid_at: new Date(),
                        status: 'CONFIRMED',
                    },
                }),
                this.prisma.payments.updateMany({
                    where: { booking_id: booking.id, payment_method: 'MOMO' },
                    data: {
                        status: 'PAID',
                        paid_at: new Date(),
                        gateway_response: JSON.stringify(body),
                        gateway_txn_id: `MOMO_${result.orderId}`,
                    },
                }),
            ]);
            this.logger.log(`MoMo IPN: booking ${result.orderId} CONFIRMED — ${result.amount.toLocaleString('vi-VN')}đ`);
        } else {
            await this.prisma.payments.updateMany({
                where: { booking_id: booking.id, payment_method: 'MOMO' },
                data: { status: 'FAILED', gateway_response: JSON.stringify(body) },
            });
            this.logger.warn(`MoMo IPN: booking ${result.orderId} FAILED — resultCode ${body['resultCode']}`);
        }

        return { resultCode: 0, message: 'Confirm Success' };
    }

    /**
     * ZaloPay Callback — ZaloPay gọi khi giao dịch hoàn tất (server-to-server).
     */
    @Post('zalopay')
    @HttpCode(200)
    async handleZaloPayCallback(@Body() body: { data: string; mac: string; type: number }) {
        this.logger.log(`ZaloPay callback: type=${body.type}`);

        const result = this.zalopayGateway.verifyCallback(body);

        if (!result.isValid) {
            this.logger.warn(`ZaloPay callback: chữ ký không hợp lệ`);
            return { return_code: -1, return_message: 'Invalid MAC' };
        }

        const booking = await this.prisma.bookings.findFirst({
            where: { booking_code: result.appTransId, deleted_at: null },
        });

        if (!booking) {
            this.logger.warn(`ZaloPay callback: không tìm thấy booking ${result.appTransId}`);
            return { return_code: -1, return_message: 'Order not found' };
        }

        if (booking.payment_status === 'PAID') {
            return { return_code: 1, return_message: 'Already confirmed' };
        }

        if (result.isSuccess) {
            await this.prisma.$transaction([
                this.prisma.bookings.update({
                    where: { id: booking.id },
                    data: {
                        payment_status: 'PAID',
                        payment_method: 'ZALOPAY',
                        paid_at: new Date(),
                        status: 'CONFIRMED',
                    },
                }),
                this.prisma.payments.updateMany({
                    where: { booking_id: booking.id, payment_method: 'ZALOPAY' },
                    data: {
                        status: 'PAID',
                        paid_at: new Date(),
                        gateway_response: body.data,
                        gateway_txn_id: `ZALOPAY_${result.appTransId}`,
                    },
                }),
            ]);
            this.logger.log(`ZaloPay callback: booking ${result.appTransId} CONFIRMED — ${result.amount.toLocaleString('vi-VN')}đ`);
        } else {
            await this.prisma.payments.updateMany({
                where: { booking_id: booking.id, payment_method: 'ZALOPAY' },
                data: { status: 'FAILED', gateway_response: body.data },
            });
            this.logger.warn(`ZaloPay callback: booking ${result.appTransId} FAILED`);
        }

        // ZaloPay yêu cầu return_code=1 để xác nhận đã nhận
        return { return_code: 1, return_message: 'Success' };
    }
}
