import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios from 'axios';

export interface MoMoInitResult {
    payment_url: string;
    order_id: string;
}

export interface MoMoIpnResult {
    isValid: boolean;
    isSuccess: boolean;
    orderId: string;
    amount: number;
    message: string;
}

@Injectable()
export class MoMoGateway {
    private readonly logger = new Logger(MoMoGateway.name);
    private readonly partnerCode: string;
    private readonly accessKey: string;
    private readonly secretKey: string;
    private readonly apiEndpoint: string;
    private readonly redirectUrl: string;
    private readonly ipnUrl: string;

    constructor(private readonly config: ConfigService) {
        this.partnerCode = config.get<string>('momo.partnerCode') ?? 'MOMO';
        this.accessKey = config.get<string>('momo.accessKey') ?? 'F8BBA842ECF85';
        this.secretKey = config.get<string>('momo.secretKey') ?? 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
        this.apiEndpoint = config.get<string>('momo.apiEndpoint') ?? 'https://test-payment.momo.vn/v2/gateway/api/create';
        this.redirectUrl = config.get<string>('momo.redirectUrl') ?? 'http://localhost:3000/checkout/momo-return';
        this.ipnUrl = config.get<string>('momo.ipnUrl') ?? 'http://localhost:3001/api/v1/payments/webhook/momo';
    }

    async createPaymentUrl(params: {
        bookingCode: string;
        amount: number;
        orderInfo: string;
    }): Promise<MoMoInitResult> {
        const orderId = params.bookingCode;
        // MoMo yêu cầu amount phải là số nguyên (VND)
        params = { ...params, amount: Math.round(params.amount) };
        const requestId = `${orderId}_${Date.now()}`;
        const extraData = '';
        const requestType = 'captureWallet';

        const rawSignature = [
            `accessKey=${this.accessKey}`,
            `amount=${params.amount}`,
            `extraData=${extraData}`,
            `ipnUrl=${this.ipnUrl}`,
            `orderId=${orderId}`,
            `orderInfo=${params.orderInfo}`,
            `partnerCode=${this.partnerCode}`,
            `redirectUrl=${this.redirectUrl}`,
            `requestId=${requestId}`,
            `requestType=${requestType}`,
        ].join('&');

        const signature = crypto.createHmac('sha256', this.secretKey)
            .update(rawSignature)
            .digest('hex');

        const body = {
            partnerCode: this.partnerCode,
            accessKey: this.accessKey,
            requestId,
            amount: params.amount,
            orderId,
            orderInfo: params.orderInfo,
            redirectUrl: this.redirectUrl,
            ipnUrl: this.ipnUrl,
            extraData,
            requestType,
            signature,
            lang: 'vi',
        };

        const response = await axios.post(this.apiEndpoint, body, {
            headers: { 'Content-Type': 'application/json' },
        });

        this.logger.log(`MoMo create: orderId=${orderId} resultCode=${response.data.resultCode}`);

        if (response.data.resultCode !== 0) {
            throw new Error(`MoMo error ${response.data.resultCode}: ${response.data.message}`);
        }

        return { payment_url: response.data.payUrl, order_id: orderId };
    }

    verifyIpn(body: Record<string, any>): MoMoIpnResult {
        try {
            const { partnerCode, orderId, requestId, amount, orderInfo, orderType,
                transId, resultCode, message, payType, responseTime, extraData, signature } = body;

            const rawSignature = [
                `accessKey=${this.accessKey}`,
                `amount=${amount}`,
                `extraData=${extraData}`,
                `message=${message}`,
                `orderId=${orderId}`,
                `orderInfo=${orderInfo}`,
                `orderType=${orderType}`,
                `partnerCode=${partnerCode}`,
                `payType=${payType}`,
                `requestId=${requestId}`,
                `responseTime=${responseTime}`,
                `resultCode=${resultCode}`,
                `transId=${transId}`,
            ].join('&');

            const expectedSig = crypto.createHmac('sha256', this.secretKey)
                .update(rawSignature)
                .digest('hex');

            const isValid = signature === expectedSig;

            return {
                isValid,
                isSuccess: isValid && Number(resultCode) === 0,
                orderId: orderId || '',
                amount: isValid ? Number(amount) : 0,
                message: message || '',
            };
        } catch (err) {
            this.logger.error('MoMo IPN verify error', err);
            return { isValid: false, isSuccess: false, orderId: '', amount: 0, message: '' };
        }
    }

    verifyReturn(query: Record<string, string>): MoMoIpnResult {
        try {
            const { partnerCode, orderId, requestId, amount, orderInfo, orderType,
                transId, resultCode, message, payType, responseTime, extraData, signature } = query;

            const rawSignature = [
                `accessKey=${this.accessKey}`,
                `amount=${amount}`,
                `extraData=${extraData}`,
                `message=${message}`,
                `orderId=${orderId}`,
                `orderInfo=${orderInfo}`,
                `orderType=${orderType}`,
                `partnerCode=${partnerCode}`,
                `payType=${payType}`,
                `requestId=${requestId}`,
                `responseTime=${responseTime}`,
                `resultCode=${resultCode}`,
                `transId=${transId}`,
            ].join('&');

            const expectedSig = crypto.createHmac('sha256', this.secretKey)
                .update(rawSignature)
                .digest('hex');

            const isValid = signature === expectedSig;

            return {
                isValid,
                isSuccess: isValid && Number(resultCode) === 0,
                orderId: orderId || '',
                amount: isValid ? Number(amount) : 0,
                message: message || '',
            };
        } catch (err) {
            this.logger.error('MoMo return verify error', err);
            return { isValid: false, isSuccess: false, orderId: '', amount: 0, message: '' };
        }
    }
}
