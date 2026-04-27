import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios from 'axios';
import { format } from 'date-fns';

export interface ZaloPayInitResult {
    payment_url: string;
    app_trans_id: string;
}

export interface ZaloPayIpnResult {
    isValid: boolean;
    isSuccess: boolean;
    appTransId: string;
    amount: number;
    message: string;
}

@Injectable()
export class ZaloPayGateway {
    private readonly logger = new Logger(ZaloPayGateway.name);
    private readonly appId: string;
    private readonly key1: string;
    private readonly key2: string;
    private readonly apiEndpoint: string;
    private readonly redirectUrl: string;
    private readonly callbackUrl: string;

    constructor(private readonly config: ConfigService) {
        this.appId = config.get<string>('zalopay.appId') ?? '2553';
        this.key1 = config.get<string>('zalopay.key1') ?? 'PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL';
        this.key2 = config.get<string>('zalopay.key2') ?? 'kLtgPl8HHhfvMuDHPwKfgfsY4Yd2uiZn';
        this.apiEndpoint = config.get<string>('zalopay.apiEndpoint') ?? 'https://sb-openapi.zalopay.vn/v2/create';
        this.redirectUrl = config.get<string>('zalopay.redirectUrl') ?? 'http://localhost:3000/checkout/zalopay-return';
        this.callbackUrl = config.get<string>('zalopay.callbackUrl') ?? 'http://localhost:3001/api/v1/payments/webhook/zalopay';
    }

    async createPaymentUrl(params: {
        bookingCode: string;
        amount: number;
        description: string;
    }): Promise<ZaloPayInitResult> {
        // ZaloPay yêu cầu amount là số nguyên
        params = { ...params, amount: Math.round(params.amount) };
        const appTime = Date.now();
        // ZaloPay yêu cầu format: yyMMdd_uniqueId
        const appTransId = `${format(new Date(), 'yyMMdd')}_${params.bookingCode}`;

        const embedData = JSON.stringify({ redirecturl: this.redirectUrl });
        const item = JSON.stringify([{
            itemid: params.bookingCode,
            itemname: params.description,
            itemprice: params.amount,
            itemquantity: 1,
        }]);

        // MAC = HMAC-SHA256(app_id|app_trans_id|app_user|amount|app_time|embed_data|item, key1)
        const rawMac = [
            this.appId,
            appTransId,
            params.bookingCode,
            params.amount,
            appTime,
            embedData,
            item,
        ].join('|');

        const mac = crypto.createHmac('sha256', this.key1)
            .update(rawMac)
            .digest('hex');

        const body = {
            app_id: Number(this.appId),
            app_user: params.bookingCode,
            app_time: appTime,
            app_trans_id: appTransId,
            amount: params.amount,
            item,
            description: params.description,
            embed_data: embedData,
            callback_url: this.callbackUrl,
            mac,
        };

        const response = await axios.post(this.apiEndpoint, body, {
            headers: { 'Content-Type': 'application/json' },
        });

        this.logger.log(`ZaloPay create: appTransId=${appTransId} returnCode=${response.data.return_code}`);

        if (response.data.return_code !== 1) {
            throw new Error(`ZaloPay error ${response.data.return_code}: ${response.data.return_message}`);
        }

        return { payment_url: response.data.order_url, app_trans_id: appTransId };
    }

    verifyCallback(body: { data: string; mac: string; type: number }): ZaloPayIpnResult {
        try {
            const { data, mac } = body;

            // Verify: HMAC-SHA256(data, key2)
            const expectedMac = crypto.createHmac('sha256', this.key2)
                .update(data)
                .digest('hex');

            const isValid = mac === expectedMac;
            if (!isValid) {
                return { isValid: false, isSuccess: false, appTransId: '', amount: 0, message: 'Invalid MAC' };
            }

            const parsed = JSON.parse(data) as {
                app_id: number;
                app_trans_id: string;
                app_time: number;
                app_user: string;
                amount: number;
                embed_data: string;
                item: string;
                zp_trans_id: number;
                server_time: number;
                channel: number;
                merchant_user_id: string;
                user_fee_amount: number;
                discount_amount: number;
            };

            // app_trans_id format: yyMMdd_bookingCode → lấy bookingCode
            const bookingCode = parsed.app_trans_id.split('_').slice(1).join('_');

            return {
                isValid: true,
                isSuccess: true,
                appTransId: bookingCode,
                amount: parsed.amount,
                message: 'Success',
            };
        } catch (err) {
            this.logger.error('ZaloPay callback verify error', err);
            return { isValid: false, isSuccess: false, appTransId: '', amount: 0, message: '' };
        }
    }

    verifyReturn(query: Record<string, string>): ZaloPayIpnResult {
        try {
            const { appid, apptransid, pmcid, bankcode, amount, discountamount, status, checksum } = query;

            // Checksum = HMAC-SHA256(appid|apptransid|pmcid|bankcode|amount|discountamount|status, key1)
            const rawMac = [appid, apptransid, pmcid, bankcode, amount, discountamount, status].join('|');
            const expectedChecksum = crypto.createHmac('sha256', this.key1)
                .update(rawMac)
                .digest('hex');

            const isValid = checksum === expectedChecksum;
            // status=1 là thành công
            const isSuccess = isValid && status === '1';

            // apptransid format: yyMMdd_bookingCode
            const bookingCode = apptransid ? apptransid.split('_').slice(1).join('_') : '';

            return {
                isValid,
                isSuccess,
                appTransId: bookingCode,
                amount: isValid ? Number(amount) : 0,
                message: isSuccess ? 'Success' : 'Failed',
            };
        } catch (err) {
            this.logger.error('ZaloPay return verify error', err);
            return { isValid: false, isSuccess: false, appTransId: '', amount: 0, message: '' };
        }
    }
}
